import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { HistoryEngine } from "../history/HistoryEngine.js";
import { EventBus } from "../doctor/EventBus.js";
import { PipelineResolver } from "./PipelineResolver.js";
import { ExecutionScheduler } from "./ExecutionScheduler.js";
import { ArtifactBus } from "./ArtifactBus.js";
import { RuntimeMetricsEngine } from "./RuntimeMetricsEngine.js";
import { EngineRegistry } from "./EngineRegistry.js";
import type { EngineManifest, ManifestAwareEngine } from "./EngineManifest.js";

export interface RuntimeKernelEvent {
  type: string;
  timestamp: string;
  stage?: string;
  engine?: string;
  details?: Record<string, unknown>;
}

export interface RuntimeKernelOptions {
  engines: IEngine[];
  maxRetries?: number;
  history?: HistoryEngine;
  eventBus?: EventBus;
  registry?: EngineRegistry;
  pipelineResolver?: PipelineResolver;
  scheduler?: ExecutionScheduler;
  artifactBus?: ArtifactBus;
  runtimeMetrics?: RuntimeMetricsEngine;
  onEvent?: (event: RuntimeKernelEvent) => void;
  onLifecycle?: (type: string, engine: string, stage?: string, details?: Record<string, unknown>) => void;
}

export class RuntimeKernel {
  private readonly context: Context;
  private readonly engines: IEngine[];
  private readonly maxRetries: number;
  private readonly history: HistoryEngine;
  private readonly registry: EngineRegistry;
  private readonly pipelineResolver: PipelineResolver;
  private readonly scheduler: ExecutionScheduler;
  private readonly artifactBus: ArtifactBus;
  private readonly runtimeMetrics: RuntimeMetricsEngine;
  private readonly eventBus: EventBus;
  private readonly onEvent?: (event: RuntimeKernelEvent) => void;
  private readonly onLifecycle?: (type: string, engine: string, stage?: string, details?: Record<string, unknown>) => void;

  constructor(context: Context, options: RuntimeKernelOptions) {
    this.context = context;
    this.engines = options.engines;
    this.maxRetries = options.maxRetries ?? 2;
    this.history = options.history ?? new HistoryEngine(this.context.projectRoot);
    this.registry = options.registry ?? new EngineRegistry();
    this.pipelineResolver = options.pipelineResolver ?? new PipelineResolver(this.registry);
    this.scheduler = options.scheduler ?? new ExecutionScheduler();
    this.artifactBus = options.artifactBus ?? new ArtifactBus();
    this.runtimeMetrics = options.runtimeMetrics ?? new RuntimeMetricsEngine();
    this.eventBus = options.eventBus ?? new EventBus();
    this.onEvent = options.onEvent;
    this.onLifecycle = options.onLifecycle;

    for (const engine of this.engines) {
      try {
        this.registry.register(engine);
      } catch {
        // Preserve backward compatibility when an engine manifest collides with an existing registration.
      }
    }
  }

  async run(): Promise<void> {
    const resolvedEngines = this.pipelineResolver.resolve(this.engines);
    const groups = this.pipelineResolver.createGroups(resolvedEngines);

    this.emitLifecycle("PIPELINE_STARTED", "RuntimeKernel", "pipeline");

    for (const group of groups) {
      for (const engine of group.engines) {
        await this.executeEngine(engine);
      }
    }

    await this.artifactBus.flush(this.context);
    await this.runtimeMetrics.collect(this.context, {
      executionTimeMs: 0,
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      cpuUsagePercent: 0,
      warnings: 0,
      errors: 0,
      retries: 0,
      knowledgeReuse: 1,
      confidence: 0.8,
    });

    this.emitLifecycle("PIPELINE_FINISHED", "RuntimeKernel", "pipeline");
    this.history.save(this.context, 0);
  }

  private async executeEngine(engine: IEngine): Promise<void> {
    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        this.emit({ type: "EngineStarted", timestamp: new Date().toISOString(), stage: engine.name, engine: engine.name });
        this.emitLifecycle("ENGINE_STARTED", engine.name, engine.name);
        await engine.run(this.context);
        this.emit({ type: "EngineCompleted", timestamp: new Date().toISOString(), stage: engine.name, engine: engine.name });
        this.emitLifecycle("ENGINE_FINISHED", engine.name, engine.name);
        return;
      } catch (error) {
        attempt += 1;
        this.emit({
          type: "EngineFailed",
          timestamp: new Date().toISOString(),
          stage: engine.name,
          engine: engine.name,
          details: { attempt, error: error instanceof Error ? error.message : String(error) },
        });
        this.emitLifecycle("ENGINE_FAILED", engine.name, engine.name, { attempt, error: error instanceof Error ? error.message : String(error) });
        if (attempt > this.maxRetries) {
          throw error;
        }
      }
    }
  }

  private emit(event: RuntimeKernelEvent): void {
    this.onEvent?.({ ...event, timestamp: new Date().toISOString() });
  }

  private emitLifecycle(type: string, engine: string, stage?: string, details?: Record<string, unknown>): void {
    this.eventBus.emitLifecycle(type, engine, stage, details);
    this.onLifecycle?.(type, engine, stage, details);
  }
}
