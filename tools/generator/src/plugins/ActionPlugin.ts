import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class ActionPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity"],
      dependencies: ["ApiPlugin"],
      name: "ActionPlugin",
      requiredBlueprintPaths: ["permissions"],
      tasks: [
        {
          template: "action/action.ts.tpl",
          output: "modules/{{names.module.kebab}}/application/{{names.entity.camel}}.actions.ts"
        }
      ]
    });
  }
}
