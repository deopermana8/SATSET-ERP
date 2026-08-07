import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class ApiPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity"],
      dependencies: ["ServicePlugin"],
      name: "ApiPlugin",
      requiredBlueprintPaths: ["permissions"],
      tasks: [
        {
          template: "api/api.ts.tpl",
          output: "modules/{{names.module.kebab}}/api/{{names.entity.camel}}.api.ts"
        }
      ]
    });
  }
}
