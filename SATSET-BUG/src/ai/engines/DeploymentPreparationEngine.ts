import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class DeploymentPreparationEngine implements IEngine {
  public readonly name = "DeploymentPreparationEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "deployment-md",
      name: "deployment-md",
      templatePath: path.join(context.projectRoot, "templates", "deployment.md.tpl"),
      outputPath: path.join(context.projectRoot, "docs", "deployment.md"),
      variables: { projectName: context.projectName },
    }]);

    context.metadata = {
      ...context.metadata,
      deployment: { status: "prepared" },
    } as typeof context.metadata & { deployment?: { status: string } };
  }
}
