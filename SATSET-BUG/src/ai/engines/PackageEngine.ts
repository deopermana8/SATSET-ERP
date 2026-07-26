import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class PackageEngine implements IEngine {
  public readonly name = "PackageEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "package-manifest",
      name: "package-manifest",
      templatePath: path.join(context.projectRoot, "templates", "manifest.json.tpl"),
      outputPath: path.join(context.projectRoot, "artifacts", "manifest.json"),
      variables: { projectName: context.projectName, status: "packaged" },
    }]);

    context.metadata = {
      ...context.metadata,
      package: { status: "packaged", artifactPath: path.join(context.projectRoot, "artifacts", "manifest.json") },
    } as typeof context.metadata & { package?: { status: string; artifactPath: string } };
  }
}
