import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class DashboardPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "dashboard"],
      dependencies: ["TablePlugin"],
      name: "DashboardPlugin",
      requiredBlueprintPaths: ["dashboard.widgets"],
      tasks: [
        {
          template: "dashboard/dashboard.ts.tpl",
          output: "modules/{{names.module.kebab}}/dashboard/{{names.module.pascal}}Dashboard.ts"
        }
      ]
    });
  }
}
