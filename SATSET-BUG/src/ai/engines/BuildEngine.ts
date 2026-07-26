import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { CommandExecutor } from "../../commands/CommandExecutor.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface BuildMetrics {
  packageManager: "pnpm" | "npm" | "yarn" | "unknown";
  installExitCode: number | null;
  compileExitCode: number | null;
  compileTimeMs: number;
  diagnostics: string[];
  logs: string[];
}

export class BuildEngine implements IEngine {
  public readonly name = "BuildEngine";
  constructor(private readonly executor = new CommandExecutor()) {}

  async run(context: Context): Promise<void> {
    const metrics: BuildMetrics = {
      packageManager: await this.detectPackageManager(context.projectRoot),
      installExitCode: null,
      compileExitCode: null,
      compileTimeMs: 0,
      diagnostics: [],
      logs: [],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "build-progress",
      name: "build-progress",
      templatePath: path.join(context.projectRoot, "templates", "build-progress.json.tpl"),
      outputPath: path.join(context.projectRoot, ".progress.json"),
      variables: {
        currentStage: "build",
        progress: "20",
        currentTask: "installing dependencies",
        estimatedRemaining: "30s",
      },
    }]);

    const installResult = await this.executor.pnpm(["install", "--ignore-scripts"], context.projectRoot);
    metrics.installExitCode = installResult.exitCode;
    metrics.logs.push(installResult.stdout, installResult.stderr);

    const startedAt = Date.now();
    const compileResult = await this.executor.pnpm(["tsc", "-p", "tsconfig.json", "--noEmit"], context.projectRoot);
    metrics.compileExitCode = compileResult.exitCode;
    metrics.compileTimeMs = Date.now() - startedAt;
    metrics.logs.push(compileResult.stdout, compileResult.stderr);

    if (compileResult.exitCode !== 0) {
      metrics.diagnostics.push(...compileResult.stderr.split(/\n+/).filter(Boolean).slice(0, 10));
    }

    context.metadata = {
      ...context.metadata,
      build: metrics,
    } as typeof context.metadata & { build?: BuildMetrics };
  }

  private async detectPackageManager(root: string): Promise<BuildMetrics["packageManager"]> {
    try {
      await fs.access(path.join(root, "pnpm-lock.yaml"));
      return "pnpm";
    } catch {
      return "unknown";
    }
  }
}
