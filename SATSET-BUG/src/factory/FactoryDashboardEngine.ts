import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import type { EngineManifest } from "../runtime/EngineManifest.js";
import { ArtifactBus } from "../runtime/ArtifactBus.js";
import { RuntimeMetricsEngine } from "../runtime/RuntimeMetricsEngine.js";
import { EventBus } from "../doctor/EventBus.js";

export interface FactoryDashboardSnapshot {
  pipeline: string[];
  knowledge: string[];
  agents: string[];
  quality: string[];
  repair: string[];
  benchmarks: string[];
  generation: string[];
  memory: string[];
  history: string[];
}

export class FactoryDashboardEngine implements IEngine {
  public readonly name = "FactoryDashboardEngine";

  constructor(
    private readonly artifactBus: ArtifactBus = new ArtifactBus(),
    private readonly eventBus: EventBus = new EventBus(),
    private readonly runtimeMetrics: RuntimeMetricsEngine = new RuntimeMetricsEngine()
  ) {}

  getManifest(): EngineManifest {
    return {
      id: "factory-dashboard",
      name: this.name,
      version: "1.0.0",
      author: "satset",
      category: "dashboard",
      priority: 45,
      enabled: true,
      timeout: 30000,
      retryPolicy: { retries: 1, backoff: 50 },
      dependencies: [],
      tags: ["dashboard", "runtime"],
    };
  }

  async run(context: Context): Promise<void> {
    const snapshot: FactoryDashboardSnapshot = {
      pipeline: ["Doctor", "Planning", "Reasoning", "Architecture", "Generation", "Validation", "Benchmark", "Knowledge"],
      knowledge: ["execution-graph.json", "prompt-bundle.json", "quality-report.json", "repair-intelligence.json", "release-bundle.json"],
      agents: ["PlannerAgent", "ArchitectAgent", "BackendAgent", "FrontendAgent", "DatabaseAgent", "QAAgent", "SecurityAgent", "PerformanceAgent", "DocumentationAgent", "ReleaseAgent"],
      quality: ["quality-report.json"],
      repair: ["repair-intelligence.json"],
      benchmarks: ["benchmark.json"],
      generation: ["generated-files.json"],
      memory: ["project-memory.json", "failure-memory.json", "success-memory.json"],
      history: ["agent-history.json"],
    };

    const outputPath = path.join(context.projectRoot, "knowledge", "factory-dashboard.json");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(snapshot, null, 2), "utf8");

    this.artifactBus.publish({
      id: "factory-dashboard-artifact",
      engine: this.name,
      kind: "factory-dashboard",
      payload: snapshot,
      outputPath,
      timestamp: new Date().toISOString(),
    });
    await this.artifactBus.flush(context);
    this.eventBus.emitLifecycle("FACTORY_DASHBOARD_READY", this.name, "dashboard");
    await this.runtimeMetrics.collect(context, {
      executionTimeMs: 1,
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      cpuUsagePercent: 0,
      warnings: 0,
      errors: 0,
      retries: 0,
      knowledgeReuse: 1,
      confidence: 0.95,
    });

    context.metadata = {
      ...context.metadata,
      factoryDashboard: snapshot,
    } as typeof context.metadata & { factoryDashboard?: FactoryDashboardSnapshot };
  }
}
