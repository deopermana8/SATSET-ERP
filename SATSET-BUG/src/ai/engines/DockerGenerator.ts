import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface DockerOutput {
  dockerfile: string[];
  compose: string[];
  env: string[];
}

export class DockerGenerator implements IEngine {
  public readonly name = "DockerGenerator";

  async run(context: Context): Promise<void> {
    const docker: DockerOutput = {
      dockerfile: ["Node base image", "Install dependencies"],
      compose: ["App + database service"],
      env: ["Environment variables"],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "dockerfile",
      name: "dockerfile",
      templatePath: path.join(context.projectRoot, "templates", "Dockerfile.tpl"),
      outputPath: path.join(context.projectRoot, "Dockerfile"),
      variables: { projectName: context.projectName },
    }, {
      id: "docker-compose",
      name: "docker-compose",
      templatePath: path.join(context.projectRoot, "templates", "docker-compose.yml.tpl"),
      outputPath: path.join(context.projectRoot, "docker-compose.yml"),
      variables: { projectName: context.projectName },
    }]);

    context.metadata = {
      ...context.metadata,
      docker,
    } as typeof context.metadata & { docker?: DockerOutput };
  }
}
