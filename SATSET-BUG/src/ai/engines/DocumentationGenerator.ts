import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface DocumentationOutput {
  overview: string[];
  setup: string[];
  usage: string[];
  architecture: string[];
}

export class DocumentationGenerator implements IEngine {
  public readonly name = "DocumentationGenerator";

  async run(context: Context): Promise<void> {
    const documentation: DocumentationOutput = {
      overview: ["SATSET autonomous project workflow"],
      setup: ["Install dependencies", "Run doctor workflow"],
      usage: ["Provide idea and run orchestration"],
      architecture: ["Engine-driven architecture"],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "project-docs",
      name: "project-docs",
      templatePath: path.join(context.projectRoot, "templates", "README.md.tpl"),
      outputPath: path.join(context.projectRoot, "README.md"),
      variables: { projectName: context.projectName },
    }]);

    context.metadata = {
      ...context.metadata,
      documentation,
    } as typeof context.metadata & { documentation?: DocumentationOutput };
  }
}
