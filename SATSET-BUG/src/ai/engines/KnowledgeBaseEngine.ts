import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class KnowledgeBaseEngine implements IEngine {
  public readonly name = "KnowledgeBaseEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "knowledge-base",
      name: "knowledge-base",
      templatePath: path.join(context.projectRoot, "templates", "knowledge-base.json.tpl"),
      outputPath: path.join(context.projectRoot, "knowledge", "knowledge-base.json"),
      variables: { projectName: context.projectName },
    }]);
  }
}
