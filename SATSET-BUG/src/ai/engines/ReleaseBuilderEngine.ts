import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class ReleaseBuilderEngine implements IEngine {
  public readonly name = "ReleaseBuilderEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "release-notes",
      name: "release-notes",
      templatePath: path.join(context.projectRoot, "templates", "release-notes.md.tpl"),
      outputPath: path.join(context.projectRoot, "release", "release-notes.md"),
      variables: { projectName: context.projectName },
    }]);
  }
}
