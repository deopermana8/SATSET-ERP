import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { NormalizedBlueprint } from "../sdk/contracts.js";

export default class UIDesignerPlugin extends TemplatePlugin {
  constructor() {
    super({
      manifest: {
        capabilities: ["ui", "dashboard", "module"],
        dependencies: ["DashboardPlugin", "FormPlugin", "TablePlugin", "ChartPlugin"],
        description: "Design responsive dashboard, form, table, chart, filter, and export layout.",
        name: "UIDesignerPlugin",
        priority: 215,
        targets: ["module", "dashboard", "report", "mobile"],
        version: "3.0.0"
      },
      tasks: [
        {
          template: "ui/ui-design.md.tpl",
          output: "modules/{{names.module.kebab}}/ui/{{names.entity.pascal}}UiDesign.md"
        }
      ]
    });
  }

  async enrichBlueprint(blueprint: NormalizedBlueprint): Promise<NormalizedBlueprint> {
    const widgets = blueprint.dashboard.widgets.length > 0
      ? blueprint.dashboard.widgets
      : [{ metric: "count(id)", name: `${blueprint.entity.toLowerCase()}Count`, type: "metric" as const }];
    return {
      ...blueprint,
      dashboard: {
        widgets
      }
    };
  }
}
