import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class DependencyResolverEngine implements IEngine {
  public readonly name = "DependencyResolverEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "dependency-map",
      name: "dependency-map",
      templatePath: path.join(context.projectRoot, "templates", "dependency-map.json.tpl"),
      outputPath: path.join(context.projectRoot, "reports", "dependency-map.json"),
      variables: { projectName: context.projectName },
    }]);
  }
}
