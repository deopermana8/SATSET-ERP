import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class PackagePublisherEngine implements IEngine {
  public readonly name = "PackagePublisherEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "package-manifest",
      name: "package-manifest",
      templatePath: path.join(context.projectRoot, "templates", "package-manifest.json.tpl"),
      outputPath: path.join(context.projectRoot, "release", "package-manifest.json"),
      variables: { projectName: context.projectName },
    }]);
  }
}
