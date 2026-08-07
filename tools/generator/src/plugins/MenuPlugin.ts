import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class MenuPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "dashboard"],
      dependencies: ["DashboardPlugin"],
      name: "MenuPlugin",
      requiredBlueprintPaths: ["menu"],
      tasks: [
        {
          template: "menu/menu.ts.tpl",
          output: "modules/{{names.module.kebab}}/navigation/menu.ts"
        }
      ]
    });
  }
}
