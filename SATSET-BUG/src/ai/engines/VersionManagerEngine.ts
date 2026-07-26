import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class VersionManagerEngine implements IEngine {
  public readonly name = "VersionManagerEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "version-json",
      name: "version-json",
      templatePath: path.join(context.projectRoot, "templates", "version.json.tpl"),
      outputPath: path.join(context.projectRoot, "release", "version.json"),
      variables: { version: "0.1.0" },
    }]);
  }
}
