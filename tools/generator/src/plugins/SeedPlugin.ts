import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class SeedPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity"],
      dependencies: ["MigrationPlugin"],
      name: "SeedPlugin",
      requiredBlueprintPaths: ["fields"],
      tasks: [
        {
          template: "seed/seed.ts.tpl",
          output: "modules/{{names.module.kebab}}/prisma/{{names.entity.camel}}.seed.ts"
        }
      ]
    });
  }
}
