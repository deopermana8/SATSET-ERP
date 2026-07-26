import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class ArchitectureDecisionEngine implements IEngine {
  public readonly name = "ArchitectureDecisionEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "architecture-decisions",
      name: "architecture-decisions",
      templatePath: path.join(context.projectRoot, "templates", "architecture-decisions.md.tpl"),
      outputPath: path.join(context.projectRoot, "docs", "architecture-decisions.md"),
      variables: { projectName: context.projectName },
    }]);
  }
}
