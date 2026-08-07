import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class DocumentationPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity", "dashboard", "report", "mobile", "scanner"],
      dependencies: ["ReportPlugin"],
      name: "DocumentationPlugin",
      requiredBlueprintPaths: ["description"],
      tasks: [
        {
          template: "documentation/readme.md.tpl",
          output: "modules/{{names.module.kebab}}/docs/README.md"
        }
      ]
    });
  }
}
