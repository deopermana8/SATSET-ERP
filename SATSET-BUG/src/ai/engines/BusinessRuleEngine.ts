import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class BusinessRuleEngine implements IEngine {
  public readonly name = "BusinessRuleEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "business-rules",
      name: "business-rules",
      templatePath: path.join(context.projectRoot, "templates", "business-rules.md.tpl"),
      outputPath: path.join(context.projectRoot, "docs", "business-rules.md"),
      variables: { projectName: context.projectName },
    }]);
  }
}
