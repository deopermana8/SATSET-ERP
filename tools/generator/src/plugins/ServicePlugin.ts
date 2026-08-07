import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class ServicePlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity"],
      dependencies: ["RepositoryPlugin"],
      name: "ServicePlugin",
      requiredBlueprintPaths: ["permissions"],
      tasks: [
        {
          template: "service/service.ts.tpl",
          output: "modules/{{names.module.kebab}}/domain/{{names.entity.pascal}}Service.ts"
        }
      ]
    });
  }
}
