import { BasePlugin } from "../sdk/BasePlugin.js";
import { GeneratedArtifact, GeneratorContextLike } from "../sdk/contracts.js";

const backendTasks = [
  {
    template: "workspace/package.json.tpl",
    output: "apps/api/package.json",
    model: {
      appName: "api",
      hasMigrationScript: true,
      hasSeedScript: true,
      hasStartScript: true
    }
  },
  {
    template: "workspace/tsconfig.app.json.tpl",
    output: "apps/api/tsconfig.json"
  },
  {
    template: "workspace/api-index.ts.tpl",
    output: "apps/api/src/index.ts"
  },
  {
    template: "workspace/api-migrate.ts.tpl",
    output: "apps/api/src/migrate.ts"
  },
  {
    template: "workspace/api-seed.ts.tpl",
    output: "apps/api/src/seed.ts"
  },
  {
    template: "workspace/api-prisma-schema.prisma.tpl",
    output: "apps/api/prisma/schema.prisma"
  },
  {
    template: "workspace/api-prisma-migration.sql.tpl",
    output: "apps/api/prisma/migrations/0001_initial/migration.sql"
  }
] as const;

export default class BackendBootstrapPlugin extends BasePlugin {
  constructor() {
    super({
      capabilities: ["backend-bootstrap", "backend-prisma"],
      dependencies: ["HostApplicationPlugin"],
      description: "Generate backend API bootstrap including prisma, migration, and seeder entrypoints.",
      name: "BackendBootstrapPlugin",
      priority: 1230,
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

    return context.generateFromTasks(this.manifest.name, backendTasks);
  }
}