import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface DeploymentOutput {
  deploymentPlan: string[];
  buildSteps: string[];
  releaseChecks: string[];
}

export class DeploymentGenerator implements IEngine {
  public readonly name = "DeploymentGenerator";

  async run(context: Context): Promise<void> {
    const deployment: DeploymentOutput = {
      deploymentPlan: ["Build", "Smoke test", "Package", "Deploy"],
      buildSteps: ["pnpm install", "pnpm tsc --noEmit", "pnpm test"],
      releaseChecks: ["Health score", "Verification", "History"],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "kubernetes-manifest",
      name: "kubernetes-manifest",
      templatePath: path.join(context.projectRoot, "templates", "deployment.yaml.tpl"),
      outputPath: path.join(context.projectRoot, "kubernetes", "deployment.yaml"),
      variables: { projectName: context.projectName },
    }]);

    context.metadata = {
      ...context.metadata,
      deployment,
    } as typeof context.metadata & { deployment?: DeploymentOutput };
  }
}
