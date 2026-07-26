import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class ExperienceEngine implements IEngine {
  public readonly name = "ExperienceEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "experience",
      name: "experience",
      templatePath: path.join(context.projectRoot, "templates", "experience.json.tpl"),
      outputPath: path.join(context.projectRoot, "knowledge", "experience.json"),
      variables: { projectName: context.projectName },
    }]);
  }
}
