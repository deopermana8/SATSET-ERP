import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class RepositoryPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity"],
      dependencies: ["PrismaPlugin"],
      name: "RepositoryPlugin",
      requiredBlueprintPaths: ["fields"],
      tasks: [
        {
          template: "repository/repository.ts.tpl",
          output: "modules/{{names.module.kebab}}/data/{{names.entity.pascal}}Repository.ts"
        }
      ]
    });
  }
}
