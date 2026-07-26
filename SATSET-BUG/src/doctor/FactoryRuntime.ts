import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { HistoryEngine } from "../history/HistoryEngine.js";
import { EventBus } from "./EventBus.js";
import { PipelineResolver } from "../runtime/PipelineResolver.js";
import { ExecutionScheduler } from "../runtime/ExecutionScheduler.js";
import { ArtifactBus } from "../runtime/ArtifactBus.js";
import { RuntimeMetricsEngine } from "../runtime/RuntimeMetricsEngine.js";
import { EngineRegistry } from "../runtime/EngineRegistry.js";

export interface RuntimeEvent {
  type: string;
  timestamp: string;
  stage?: string;
  engine?: string;
  details?: Record<string, unknown>;
}

export interface FactoryRuntimeOptions {
  engines: IEngine[];
  maxRetries?: number;
}

export class FactoryRuntime {
  private readonly history: HistoryEngine;
  private readonly engines: IEngine[];
  private readonly maxRetries: number;
  private readonly events: RuntimeEvent[] = [];
  private readonly eventBus: EventBus;
  private readonly pipelineResolver: PipelineResolver;
  private readonly scheduler: ExecutionScheduler;
  private readonly artifactBus: ArtifactBus;
  private readonly runtimeMetrics: RuntimeMetricsEngine;
  private readonly registry: EngineRegistry;

  constructor(private readonly context: Context, options: FactoryRuntimeOptions) {
    this.history = new HistoryEngine(this.context.projectRoot);
    this.engines = options.engines;
    this.maxRetries = options.maxRetries ?? 2;
    this.eventBus = new EventBus();
    this.registry = new EngineRegistry();
    this.pipelineResolver = new PipelineResolver(this.registry);
    this.scheduler = new ExecutionScheduler();
    this.artifactBus = new ArtifactBus();
    this.runtimeMetrics = new RuntimeMetricsEngine();
  }

  async run(): Promise<void> {
    const resolvedEngines = this.pipelineResolver.resolve(this.engines);
    const groups = await this.scheduler.createGroups(resolvedEngines);
    this.eventBus.emitLifecycle("PIPELINE_STARTED", "FactoryRuntime", "pipeline");

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

    this.eventBus.emitLifecycle("PIPELINE_FINISHED", "FactoryRuntime", "pipeline");
    this.history.save(this.context, 0);
    this.context.metadata = {
      ...this.context.metadata,
      historyEvents: this.events,
    } as typeof this.context.metadata & { historyEvents?: RuntimeEvent[] };
  }

  private async executeEngine(engine: IEngine): Promise<void> {
    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        this.emit({ type: "EngineStarted", timestamp: new Date().toISOString(), stage: engine.name, engine: engine.name });
        this.eventBus.emitLifecycle("ENGINE_STARTED", engine.name, engine.name);
        await engine.run(this.context);
        this.emit({ type: "EngineCompleted", timestamp: new Date().toISOString(), stage: engine.name, engine: engine.name });
        this.eventBus.emitLifecycle("ENGINE_FINISHED", engine.name, engine.name);
        return;
      } catch (error) {
        attempt += 1;
        this.emit({ type: "EngineFailed", timestamp: new Date().toISOString(), stage: engine.name, engine: engine.name, details: { attempt, error: error instanceof Error ? error.message : String(error) } });
        this.eventBus.emitLifecycle("ENGINE_FAILED", engine.name, engine.name, { attempt, error: error instanceof Error ? error.message : String(error) });
        if (attempt > this.maxRetries) {
          throw error;
        }
      }
    }
  }

  private emit(event: RuntimeEvent): void {
    this.events.push({ ...event, timestamp: new Date().toISOString() });
  }
}
