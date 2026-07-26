import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export class AuditEngine implements IEngine {
  public readonly name = "AuditEngine";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "audit-md",
      name: "audit-md",
      templatePath: path.join(context.projectRoot, "templates", "audit.md.tpl"),
      outputPath: path.join(context.projectRoot, "docs", "audit.md"),
      variables: { projectName: context.projectName },
    }]);

    context.metadata = {
      ...context.metadata,
      audit: { status: "recorded" },
    } as typeof context.metadata & { audit?: { status: string } };
  }
}
