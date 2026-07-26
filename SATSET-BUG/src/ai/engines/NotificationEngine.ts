import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class NotificationEngine implements IEngine {
  public readonly name = "NotificationEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "summary-json",
      name: "summary-json",
      templatePath: path.join(context.projectRoot, "templates", "summary.json.tpl"),
      outputPath: path.join(context.projectRoot, "reports", "summary.json"),
      variables: { status: "ready" },
    }]);

    context.metadata = {
      ...context.metadata,
      notification: { status: "ready" },
    } as typeof context.metadata & { notification?: { status: string } };
  }
}
