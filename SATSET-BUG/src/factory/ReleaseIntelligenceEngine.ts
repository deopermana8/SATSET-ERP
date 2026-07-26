import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import type { EngineManifest } from "../runtime/EngineManifest.js";
import { ArtifactBus } from "../runtime/ArtifactBus.js";
import { RuntimeMetricsEngine } from "../runtime/RuntimeMetricsEngine.js";
import { EventBus } from "../doctor/EventBus.js";

export interface ReleaseBundle {
  changelog: string;
  releaseNotes: string;
  version: string;
  migrationGuide: string;
  deploymentGuide: string;
  rollbackGuide: string;
}

export class ReleaseIntelligenceEngine implements IEngine {
  public readonly name = "ReleaseIntelligenceEngine";

  constructor(
    private readonly artifactBus: ArtifactBus = new ArtifactBus(),
    private readonly eventBus: EventBus = new EventBus(),
    private readonly runtimeMetrics: RuntimeMetricsEngine = new RuntimeMetricsEngine()
  ) {}

  getManifest(): EngineManifest {
    return {
      id: "release-intelligence",
      name: this.name,
      version: "1.0.0",
      author: "satset",
      category: "release",
      priority: 40,
      enabled: true,
      timeout: 30000,
      retryPolicy: { retries: 1, backoff: 50 },
      dependencies: [],
      tags: ["release", "runtime"],
    };
  }

  async run(context: Context): Promise<void> {
    const bundle: ReleaseBundle = {
      changelog: `Release for ${context.projectName}`,
      releaseNotes: `Stable release notes for ${context.projectName}`,
      version: "1.0.0",
      migrationGuide: "Follow the standard migration steps.",
      deploymentGuide: "Deploy with the standard pipeline.",
      rollbackGuide: "Revert to the previous stable package.",
    };

    const outputPath = path.join(context.projectRoot, "knowledge", "release-bundle.json");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(bundle, null, 2), "utf8");

    this.artifactBus.publish({
      id: "release-bundle-artifact",
      engine: this.name,
      kind: "release-bundle",
      payload: bundle,
      outputPath,
      timestamp: new Date().toISOString(),
    });
    await this.artifactBus.flush(context);
    this.eventBus.emitLifecycle("RELEASE_BUNDLE_READY", this.name, "release");
    await this.runtimeMetrics.collect(context, {
      executionTimeMs: 1,
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      cpuUsagePercent: 0,
      warnings: 0,
      errors: 0,
      retries: 0,
      knowledgeReuse: 1,
      confidence: 0.9,
    });

    context.metadata = {
      ...context.metadata,
      releaseBundle: bundle,
    } as typeof context.metadata & { releaseBundle?: ReleaseBundle };
  }
}
