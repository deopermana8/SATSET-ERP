import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface OpenApiOutput {
  specPath: string;
  title: string;
}

export class OpenApiGenerator implements IEngine {
  public readonly name = "OpenApiGenerator";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "openapi-docs",
      name: "openapi-docs",
      templatePath: path.join(context.projectRoot, "templates", "openapi.yaml.tpl"),
      outputPath: path.join(context.projectRoot, "docs", "openapi.yaml"),
      variables: {
        projectName: context.projectName,
      },
    }]);

    context.metadata = {
      ...context.metadata,
      openApi: { specPath: path.join(context.projectRoot, "docs", "openapi.yaml"), title: context.projectName },
    } as typeof context.metadata & { openApi?: OpenApiOutput };
  }
}
