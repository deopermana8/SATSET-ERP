import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class SelfHealingEngine implements IEngine {
  public readonly name = "SelfHealingEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "self-healing",
      name: "self-healing",
      templatePath: path.join(context.projectRoot, "templates", "self-healing.md.tpl"),
      outputPath: path.join(context.projectRoot, "docs", "self-healing.md"),
      variables: { projectName: context.projectName },
    }]);
  }
}
