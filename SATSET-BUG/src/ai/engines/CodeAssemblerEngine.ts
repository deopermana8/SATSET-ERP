import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class CodeAssemblerEngine implements IEngine {
  public readonly name = "CodeAssemblerEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "assembly-report",
      name: "assembly-report",
      templatePath: path.join(context.projectRoot, "templates", "assembly-report.md.tpl"),
      outputPath: path.join(context.projectRoot, "src", "generated", "assembly-report.md"),
      variables: { projectName: context.projectName },
    }]);
  }
}
