import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class CrudPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity"],
      dependencies: [],
      name: "CrudPlugin",
      requiredBlueprintPaths: ["fields"],
      tasks: [
        {
          template: "crud/module.ts.tpl",
          output: "modules/{{names.module.kebab}}/core/{{names.module.pascal}}Module.ts"
        }
      ]
    });
  }
}
