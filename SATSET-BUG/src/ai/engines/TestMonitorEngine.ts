import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class TestMonitorEngine implements IEngine {
  public readonly name = "TestMonitorEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "test-monitor",
      name: "test-monitor",
      templatePath: path.join(context.projectRoot, "templates", "test-monitor.json.tpl"),
      outputPath: path.join(context.projectRoot, "reports", "test-monitor.json"),
      variables: { projectName: context.projectName },
    }]);
  }
}
