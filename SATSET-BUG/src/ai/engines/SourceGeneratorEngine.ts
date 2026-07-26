import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class SourceGeneratorEngine implements IEngine {
  public readonly name = "SourceGeneratorEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "source-manifest",
      name: "source-manifest",
      templatePath: path.join(context.projectRoot, "templates", "source-manifest.json.tpl"),
      outputPath: path.join(context.projectRoot, "src", "generated", "source-manifest.json"),
      variables: { projectName: context.projectName },
    }]);
  }
}
