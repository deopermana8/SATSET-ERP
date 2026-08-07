import { BasePlugin } from "../sdk/BasePlugin.js";
import { GeneratedArtifact, GeneratorContextLike } from "../sdk/contracts.js";

const workspaceTasks = [
  {
    template: "workspace/root-package.json.tpl",
    output: "package.json"
  },
  {
    template: "workspace/pnpm-workspace.yaml.tpl",
    output: "pnpm-workspace.yaml"
  },
  {
    template: "workspace/tsconfig.json.tpl",
    output: "tsconfig.json"
  },
  {
    template: "workspace/package-shared.json.tpl",
    output: "packages/shared/package.json"
  },
  {
    template: "workspace/tsconfig.shared.json.tpl",
    output: "packages/shared/tsconfig.json"
  },
  {
    template: "workspace/shared-index.ts.tpl",
    output: "packages/shared/src/index.ts"
  }
] as const;

export default class WorkspacePlugin extends BasePlugin {
  constructor() {
    super({
      capabilities: ["workspace", "bootstrap"],
      dependencies: [
        "HostApplicationPlugin",
        "AdminBootstrapPlugin",
        "BackendBootstrapPlugin",
        "RuntimeGeneratorPlugin",
        "EnvironmentGeneratorPlugin"
      ],
      description: "Bootstrap a runnable workspace with apps, packages, scripts, and environment defaults.",
      name: "WorkspacePlugin",
      priority: 1220,
      targets: ["workspace"],
      version: "1.0.0"
    });
  }

  dependencies(): readonly string[] {
    return [];
  }

  async generate(context: GeneratorContextLike): Promise<GeneratedArtifact[]> {
    const firstEntity = context.blueprint.entities[0]?.name;
    if (!firstEntity || context.currentEntity.name !== firstEntity) {
      return [];
    }

    return context.generateFromTasks(this.manifest.name, workspaceTasks);
  }
}