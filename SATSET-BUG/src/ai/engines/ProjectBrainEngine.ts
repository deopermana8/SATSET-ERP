import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class ProjectBrainEngine implements IEngine {
  public readonly name = "ProjectBrainEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "project-brain",
      name: "project-brain",
      templatePath: path.join(context.projectRoot, "templates", "project-brain.json.tpl"),
      outputPath: path.join(context.projectRoot, "reports", "project-brain.json"),
      variables: { projectName: context.projectName, idea: String(context.metadata?.idea ?? "") },
    }]);
  }
}
