import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class MigrationPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity"],
      dependencies: ["PrismaPlugin"],
      name: "MigrationPlugin",
      requiredBlueprintPaths: ["fields"],
      tasks: [
        {
          template: "migration/migration.sql.tpl",
          output: "modules/{{names.module.kebab}}/prisma/migrations/{{names.module.kebab}}.sql"
        }
      ]
    });
  }
}
