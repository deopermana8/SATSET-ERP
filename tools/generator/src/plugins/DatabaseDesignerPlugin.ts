import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { NormalizedBlueprint } from "../sdk/contracts.js";

export default class DatabaseDesignerPlugin extends TemplatePlugin {
  constructor() {
    super({
      manifest: {
        capabilities: ["database", "module"],
        dependencies: ["PrismaPlugin", "MigrationPlugin", "SeedPlugin"],
        description: "Enrich blueprint with database constraints, indexes, and seed design.",
        name: "DatabaseDesignerPlugin",
        priority: 210,
        targets: ["module", "entity"],
        version: "3.0.0"
      },
      tasks: [
        {
          template: "database/database-design.md.tpl",
          output: "modules/{{names.module.kebab}}/database/{{names.entity.pascal}}Database.md"
        }
      ]
    });
  }

  async enrichBlueprint(blueprint: NormalizedBlueprint): Promise<NormalizedBlueprint> {
    if (blueprint.seed.length > 0 && blueprint.validation.length > 0) {
      return blueprint;
    }

    return {
      ...blueprint,
      seed: blueprint.seed.length > 0 ? blueprint.seed : [{
        name: `${blueprint.entity}Seed`,
        fields: Object.fromEntries(blueprint.fields.map((field) => [field.name, field.default ?? field.label]))
      }],
      validation: blueprint.validation.length > 0 ? blueprint.validation : blueprint.fields.map((field) => ({
        field: field.name,
        message: `${field.label} must be valid`,
        rule: field.required ? "required" : "optional"
      }))
    };
  }
}
