import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class PerformanceAnalyzerEngine implements IEngine {
  public readonly name = "PerformanceAnalyzerEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "performance",
      name: "performance",
      templatePath: path.join(context.projectRoot, "templates", "performance.json.tpl"),
      outputPath: path.join(context.projectRoot, "reports", "performance.json"),
      variables: { projectName: context.projectName },
    }]);
  }
}
