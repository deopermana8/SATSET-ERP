import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class SidebarPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "dashboard"],
      dependencies: ["MenuPlugin"],
      name: "SidebarPlugin",
      requiredBlueprintPaths: ["menu"],
      tasks: [
        {
          template: "sidebar/sidebar.ts.tpl",
          output: "modules/{{names.module.kebab}}/navigation/sidebar.ts"
        }
      ]
    });
  }
}
