import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class SecurityScannerEngine implements IEngine {
  public readonly name = "SecurityScannerEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "security-scan",
      name: "security-scan",
      templatePath: path.join(context.projectRoot, "templates", "security-scan.json.tpl"),
      outputPath: path.join(context.projectRoot, "reports", "security-scan.json"),
      variables: { projectName: context.projectName },
    }]);
  }
}
