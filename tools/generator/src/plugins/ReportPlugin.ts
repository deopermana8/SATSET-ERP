import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class ReportPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "dashboard", "report"],
      dependencies: ["PermissionPlugin"],
      name: "ReportPlugin",
      requiredBlueprintPaths: ["reports"],
      tasks: [
        {
          template: "report/report.md.tpl",
          output: "modules/{{names.module.kebab}}/reports/{{names.module.kebab}}-report.md"
        }
      ]
    });
  }
}
