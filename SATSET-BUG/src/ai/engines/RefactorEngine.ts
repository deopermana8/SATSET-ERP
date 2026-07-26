import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class RefactorEngine implements IEngine {
  public readonly name = "RefactorEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "refactor-plan",
      name: "refactor-plan",
      templatePath: path.join(context.projectRoot, "templates", "refactor-plan.md.tpl"),
      outputPath: path.join(context.projectRoot, "docs", "refactor-plan.md"),
      variables: { projectName: context.projectName },
    }]);
  }
}
