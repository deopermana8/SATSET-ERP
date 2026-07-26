import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class CompileMonitorEngine implements IEngine {
  public readonly name = "CompileMonitorEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "compile-monitor",
      name: "compile-monitor",
      templatePath: path.join(context.projectRoot, "templates", "compile-monitor.json.tpl"),
      outputPath: path.join(context.projectRoot, "reports", "compile-monitor.json"),
      variables: { projectName: context.projectName },
    }]);
  }
}
