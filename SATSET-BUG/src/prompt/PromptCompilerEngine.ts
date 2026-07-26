import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import type { EngineManifest } from "../runtime/EngineManifest.js";
import { ArtifactBus } from "../runtime/ArtifactBus.js";
import { RuntimeMetricsEngine } from "../runtime/RuntimeMetricsEngine.js";
import { EventBus } from "../doctor/EventBus.js";

export interface PromptBundle {
  systemPrompt: string;
  developerPrompt: string;
  executionPrompt: string;
  repairPrompt: string;
  reflectionPrompt: string;
}

export class PromptCompilerEngine implements IEngine {
  public readonly name = "PromptCompilerEngine";

  constructor(
    private readonly artifactBus: ArtifactBus = new ArtifactBus(),
    private readonly eventBus: EventBus = new EventBus(),
    private readonly runtimeMetrics: RuntimeMetricsEngine = new RuntimeMetricsEngine()
  ) {}

  getManifest(): EngineManifest {
    return {
      id: "prompt-compiler",
      name: this.name,
      version: "1.0.0",
      author: "satset",
      category: "prompting",
      priority: 45,
      enabled: true,
      timeout: 30000,
      retryPolicy: { retries: 1, backoff: 50 },
      dependencies: [],
      tags: ["prompting", "runtime"],
    };
  }

  async run(context: Context): Promise<void> {
    const idea = typeof context.metadata?.idea === "string" ? String(context.metadata.idea) : context.projectName;
    const bundle: PromptBundle = {
      systemPrompt: `You are SATSET operating on ${idea}. Follow the existing Doctor runtime and preserve architecture, generation, and validation flow.`,
      developerPrompt: `Implement features for ${idea} using the existing runtime, maintain quality, and persist knowledge artifacts.`,
      executionPrompt: `Analyze, plan, generate, compile, test, benchmark, repair, and record state for ${idea}.`,
      repairPrompt: `If failures occur, diagnose the cause, patch the smallest viable fix, retry, benchmark, and persist the repair outcome.`,
      reflectionPrompt: `Review results, learn from errors, update memory and architecture guidance, and continue the loop until success.`,
    };

    const outputPath = path.join(context.projectRoot, "knowledge", "prompt-bundle.json");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(bundle, null, 2), "utf8");

    this.artifactBus.publish({
      id: "prompt-bundle-artifact",
      engine: this.name,
      kind: "prompt-bundle",
      payload: bundle,
      outputPath,
      timestamp: new Date().toISOString(),
    });
    await this.artifactBus.flush(context);
    this.eventBus.emitLifecycle("PROMPT_BUNDLE_READY", this.name, "prompting");
    await this.runtimeMetrics.collect(context, {
      executionTimeMs: 1,
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      cpuUsagePercent: 0,
      warnings: 0,
      errors: 0,
      retries: 0,
      knowledgeReuse: 1,
      confidence: 0.92,
    });

    context.metadata = {
      ...context.metadata,
      promptBundle: bundle,
    } as typeof context.metadata & { promptBundle?: PromptBundle };
  }
}
