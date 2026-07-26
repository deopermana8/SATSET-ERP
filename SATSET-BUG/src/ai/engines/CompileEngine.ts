import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { CommandExecutor } from "../../commands/CommandExecutor.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface CompileMetrics {
  timestamp: string;
  diagnostics: string[];
  exitCode: number | null;
  toolchain: string[];
}

export class CompileEngine implements IEngine {
  public readonly name = "CompileEngine";
  constructor(private readonly executor = new CommandExecutor()) {}

  async run(context: Context): Promise<void> {
    const metrics: CompileMetrics = {
      timestamp: new Date().toISOString(),
      diagnostics: [],
      exitCode: null,
      toolchain: ["typescript", "next", "react", "node", "prisma"],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "compile-progress",
      name: "compile-progress",
      templatePath: path.join(context.projectRoot, "templates", "compile-progress.json.tpl"),
      outputPath: path.join(context.projectRoot, ".progress.json"),
      variables: {
        currentStage: "compile",
        progress: "40",
        currentTask: "compiling project",
        estimatedRemaining: "25s",
      },
    }]);

    const result = await this.executor.pnpm(["tsc", "-p", "tsconfig.json", "--noEmit"], context.projectRoot);
    metrics.exitCode = result.exitCode;
    metrics.diagnostics.push(...result.stderr.split(/\n+/).filter(Boolean).slice(0, 10));

    context.metadata = {
      ...context.metadata,
      compile: metrics,
    } as typeof context.metadata & { compile?: CompileMetrics };
  }
}
