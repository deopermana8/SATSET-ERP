import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class ReleaseEngine implements IEngine {
  public readonly name = "ReleaseEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "release-json",
      name: "release-json",
      templatePath: path.join(context.projectRoot, "templates", "release.json.tpl"),
      outputPath: path.join(context.projectRoot, "release.json"),
      variables: { projectName: context.projectName, status: "released" },
    }]);

    context.metadata = {
      ...context.metadata,
      release: { status: "released" },
    } as typeof context.metadata & { release?: { status: string } };
  }
}
