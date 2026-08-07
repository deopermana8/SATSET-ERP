import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class ChartPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "dashboard", "report"],
      dependencies: ["DashboardPlugin"],
      name: "ChartPlugin",
      requiredBlueprintPaths: ["dashboard.widgets"],
      tasks: [
        {
          template: "chart/chart.ts.tpl",
          output: "modules/{{names.module.kebab}}/dashboard/{{names.module.pascal}}Chart.ts"
        }
      ]
    });
  }
}
