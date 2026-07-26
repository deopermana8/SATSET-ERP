import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class ModulePlannerEngine implements IEngine {
  public readonly name = "ModulePlannerEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "module-plan",
      name: "module-plan",
      templatePath: path.join(context.projectRoot, "templates", "module-plan.json.tpl"),
      outputPath: path.join(context.projectRoot, "reports", "module-plan.json"),
      variables: { projectName: context.projectName },
    }]);
  }
}
