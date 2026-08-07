import { BasePlugin } from "../sdk/BasePlugin.js";
import { GeneratedArtifact, GeneratorContextLike } from "../sdk/contracts.js";

const adminTasks = [
  {
    template: "workspace/package.json.tpl",
    output: "apps/admin/package.json",
    model: {
      appName: "admin",
      hasMigrationScript: false,
      hasSeedScript: false,
      hasStartScript: true
    }
  },
  {
    template: "workspace/tsconfig.app.json.tpl",
    output: "apps/admin/tsconfig.json"
  },
  {
    template: "workspace/admin-index.ts.tpl",
    output: "apps/admin/src/index.ts"
  }
] as const;

export default class AdminBootstrapPlugin extends BasePlugin {
  constructor() {
    super({
      capabilities: ["admin-bootstrap"],
      dependencies: ["HostApplicationPlugin"],
      description: "Generate admin host application scaffold.",
      name: "AdminBootstrapPlugin",
      priority: 1240,
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

    return context.generateFromTasks(this.manifest.name, adminTasks);
  }
}