import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface ProjectScaffolderOutput {
  files: string[];
}

export class ProjectScaffolder implements IEngine {
  public readonly name = "ProjectScaffolder";

  async run(context: Context): Promise<void> {
    const pipeline = new ArtifactPipeline(context.projectRoot);
    const files = [
      { file: "package.json", template: "package.json.tpl" },
      { file: "tsconfig.json", template: "tsconfig.json.tpl" },
      { file: "eslint.config.js", template: "eslint.config.js.tpl" },
      { file: "prettier.config.js", template: "prettier.config.js.tpl" },
      { file: ".env.example", template: "env.example.tpl" },
      { file: ".gitignore", template: "gitignore.tpl" },
      { file: "README.md", template: "README.md.tpl" },
      { file: "Dockerfile", template: "Dockerfile.tpl" },
      { file: ".github/workflows/ci.yml", template: "ci.yml.tpl" },
    ];

    const specs = files.map(({ file, template }) => ({
      id: file,
      name: file,
      templatePath: path.join(context.projectRoot, "templates", template),
      outputPath: path.join(context.projectRoot, file),
      variables: {
        projectName: context.projectName,
      },
    }));

    await pipeline.run(context, specs);

    context.metadata = {
      ...context.metadata,
      scaffolder: { files: files.map((entry) => entry.file) },
    } as typeof context.metadata & { scaffolder?: ProjectScaffolderOutput };
  }
}
