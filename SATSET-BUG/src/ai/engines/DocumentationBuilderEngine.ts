import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class DocumentationBuilderEngine implements IEngine {
  public readonly name = "DocumentationBuilderEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "factory-documentation",
      name: "factory-documentation",
      templatePath: path.join(context.projectRoot, "templates", "factory-documentation.md.tpl"),
      outputPath: path.join(context.projectRoot, "docs", "factory-documentation.md"),
      variables: { projectName: context.projectName },
    }]);
  }
}
