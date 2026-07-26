import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface ArchitectureBuilderOutput {
  docs: string[];
}

export class ArchitectureBuilder implements IEngine {
  public readonly name = "ArchitectureBuilder";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    const docs = [
      "architecture.md",
      "modules.md",
      "api.md",
      "database.md",
      "security.md",
      "workflow.md",
    ];

    const specs = docs.map((file) => ({
      id: file,
      name: file,
      templatePath: path.join(context.projectRoot, "templates", `${file}.tpl`),
      outputPath: path.join(context.projectRoot, "docs", file),
      variables: {
        projectName: context.projectName,
      },
    }));

    await pipeline.run(context, specs);

    context.metadata = {
      ...context.metadata,
      architectureBuilder: { docs },
    } as typeof context.metadata & { architectureBuilder?: ArchitectureBuilderOutput };
  }
}
