import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class RequirementRefinementEngine implements IEngine {
  public readonly name = "RequirementRefinementEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "refined-requirements",
      name: "refined-requirements",
      templatePath: path.join(context.projectRoot, "templates", "refined-requirements.json.tpl"),
      outputPath: path.join(context.projectRoot, "requirements", "refined-requirements.json"),
      variables: { projectName: context.projectName },
    }]);
  }
}
