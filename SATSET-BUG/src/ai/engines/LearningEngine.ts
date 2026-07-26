import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class LearningEngine implements IEngine {
  public readonly name = "LearningEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "learning-md",
      name: "learning-md",
      templatePath: path.join(context.projectRoot, "templates", "learning.md.tpl"),
      outputPath: path.join(context.projectRoot, "docs", "learning.md"),
      variables: { projectName: context.projectName },
    }]);

    context.metadata = {
      ...context.metadata,
      learning: { status: "captured" },
    } as typeof context.metadata & { learning?: { status: string } };
  }
}
