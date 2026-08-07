import { BasePlugin } from "../sdk/BasePlugin.js";
import { GeneratedArtifact, GeneratorContextLike } from "../sdk/contracts.js";

const runtimeTasks = [
  {
    template: "workspace/scripts/start.mjs.tpl",
    output: "scripts/start.mjs"
  },
  {
    template: "workspace/package.json.tpl",
    output: "apps/worker/package.json",
    model: {
      appName: "worker",
      hasMigrationScript: false,
      hasSeedScript: false,
      hasStartScript: true
    }
  },
  {
    template: "workspace/tsconfig.app.json.tpl",
    output: "apps/worker/tsconfig.json"
  },
  {
    template: "workspace/worker-index.ts.tpl",
    output: "apps/worker/src/index.ts"
  },
  {
    template: "workspace/docker-compose.yml.tpl",
    output: "docker/docker-compose.yml"
  },
  {
    template: "workspace/docker/admin.Dockerfile.tpl",
    output: "docker/admin.Dockerfile"
  },
  {
    template: "workspace/docker/api.Dockerfile.tpl",
    output: "docker/api.Dockerfile"
  },
  {
    template: "workspace/docker/worker.Dockerfile.tpl",
    output: "docker/worker.Dockerfile"
  }
] as const;

export default class RuntimeGeneratorPlugin extends BasePlugin {
  constructor() {
    super({
      capabilities: ["runtime", "docker"],
      dependencies: ["AdminBootstrapPlugin", "BackendBootstrapPlugin"],
      description: "Generate runtime and docker assets for workspace host applications.",
      name: "RuntimeGeneratorPlugin",
      priority: 1210,
      targets: ["workspace"],
      version: "1.0.0"
    });
  }

  dependencies(): readonly string[] {
    return this.manifest.dependencies;
  }

  async generate(context: GeneratorContextLike): Promise<GeneratedArtifact[]> {
    const firstEntity = context.blueprint.entities[0]?.name;
    if (!firstEntity || context.currentEntity.name !== firstEntity) {
      return [];
    }

    return context.generateFromTasks(this.manifest.name, runtimeTasks);
  }
}