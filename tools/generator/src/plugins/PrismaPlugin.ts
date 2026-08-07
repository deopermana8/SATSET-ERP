import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class PrismaPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity"],
      dependencies: ["CrudPlugin"],
      name: "PrismaPlugin",
      requiredBlueprintPaths: ["fields", "relations"],
      tasks: [
        {
          template: "prisma/model.prisma.tpl",
          output: "modules/{{names.module.kebab}}/{{names.entity.kebab}}/prisma/{{names.entity.kebab}}.prisma"
        }
      ]
    });
  }
}
