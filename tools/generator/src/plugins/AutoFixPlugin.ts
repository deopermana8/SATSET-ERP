import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class AutoFixPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity", "dashboard", "report", "mobile", "scanner"],
      dependencies: ["DocumentationPlugin", "MobilePlugin", "ScannerPlugin", "SidebarPlugin", "RolePlugin"],
      name: "AutoFixPlugin",
      tasks: [
        {
          template: "autofix/request.json.tpl",
          output: "modules/{{names.module.kebab}}/autofix/request.json"
        }
      ]
    });
  }
}
