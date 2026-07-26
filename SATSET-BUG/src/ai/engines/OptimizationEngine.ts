import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class OptimizationEngine implements IEngine {
  public readonly name = "OptimizationEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "optimization-md",
      name: "optimization-md",
      templatePath: path.join(context.projectRoot, "templates", "optimization.md.tpl"),
      outputPath: path.join(context.projectRoot, "docs", "optimization.md"),
      variables: { projectName: context.projectName },
    }]);

    context.metadata = {
      ...context.metadata,
      optimization: { status: "optimized" },
    } as typeof context.metadata & { optimization?: { status: string } };
  }
}
