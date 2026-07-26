import { Context, ContextParams } from "./Context.js";
import type { IEngine } from "./IEngine.js";
import type { EngineManifest } from "../runtime/EngineManifest.js";

export class Engine implements IEngine {
  public readonly name = "Engine";
  private readonly params: ContextParams;

  constructor(params: ContextParams) {
    this.params = params;
  }

  getManifest(): EngineManifest {
    return {
      id: "engine",
      name: this.name,
      version: "1.0.0",
      author: "satset",
      category: "core",
      priority: 0,
      enabled: true,
      timeout: 30000,
      retryPolicy: { retries: 0, backoff: 0 },
      dependencies: [],
      tags: ["core"],
    };
  }

  async run(context: Context): Promise<void> {
    context.projectRoot = this.params.projectRoot;
    context.projectName = this.params.projectName;
    context.nodeVersion = this.params.nodeVersion;
    context.pnpmVersion = this.params.pnpmVersion;
    context.typescriptVersion = this.params.typescriptVersion;
    context.prismaVersion = this.params.prismaVersion;
    context.nextVersion = this.params.nextVersion;
    context.issues = this.params.issues;
    context.recommendations = this.params.recommendations;
    context.metadata = this.params.metadata;
    context.diagnosis = this.params.diagnosis;
    context.rootCauses = this.params.rootCauses;
    context.repairPlans = this.params.repairPlans;
    context.repairOptions = this.params.repairOptions;
    context.repairLog = this.params.repairLog ?? [];
    context.repairLoop = this.params.repairLoop;
    context.repairSummary = this.params.repairSummary;
    context.health = this.params.health ?? null;
    context.verification = this.params.verification;
  }
}
