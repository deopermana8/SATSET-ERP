import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import type { EngineManifest } from "../runtime/EngineManifest.js";
import { ArtifactBus } from "../runtime/ArtifactBus.js";
import { RuntimeMetricsEngine } from "../runtime/RuntimeMetricsEngine.js";
import { EventBus } from "../doctor/EventBus.js";

export interface RepairIntelligenceSnapshot {
  diagnosis: string;
  repair: string;
  retry: number;
  benchmark: string;
  stored: boolean;
}

export class RepairIntelligenceEngine implements IEngine {
  public readonly name = "RepairIntelligenceEngine";

  constructor(
    private readonly artifactBus: ArtifactBus = new ArtifactBus(),
    private readonly eventBus: EventBus = new EventBus(),
    private readonly runtimeMetrics: RuntimeMetricsEngine = new RuntimeMetricsEngine()
  ) {}

  getManifest(): EngineManifest {
    return {
      id: "repair-intelligence",
      name: this.name,
      version: "1.0.0",
      author: "satset",
      category: "repair",
      priority: 45,
      enabled: true,
      timeout: 30000,
      retryPolicy: { retries: 2, backoff: 100 },
      dependencies: [],
      tags: ["repair", "runtime"],
    };
  }

  async run(context: Context): Promise<void> {
    const snapshot: RepairIntelligenceSnapshot = {
      diagnosis: "Failed build or test detected",
      repair: "Apply minimal patch and re-run",
      retry: 2,
      benchmark: "Compare before and after metrics",
      stored: true,
    };

    const outputPath = path.join(context.projectRoot, "knowledge", "repair-intelligence.json");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(snapshot, null, 2), "utf8");

    this.artifactBus.publish({
      id: "repair-intelligence-artifact",
      engine: this.name,
      kind: "repair-intelligence",
      payload: snapshot,
      outputPath,
      timestamp: new Date().toISOString(),
    });
    await this.artifactBus.flush(context);
    this.eventBus.emitLifecycle("REPAIR_INTELLIGENCE_READY", this.name, "repair");
    await this.runtimeMetrics.collect(context, {
      executionTimeMs: 1,
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      cpuUsagePercent: 0,
      warnings: 0,
      errors: 0,
      retries: 2,
      knowledgeReuse: 1,
      confidence: 0.9,
    });

    context.metadata = {
      ...context.metadata,
      repairIntelligence: snapshot,
    } as typeof context.metadata & { repairIntelligence?: RepairIntelligenceSnapshot };
  }
}
