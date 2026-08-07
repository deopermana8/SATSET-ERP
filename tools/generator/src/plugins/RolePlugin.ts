import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class RolePlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "dashboard", "report"],
      dependencies: ["PermissionPlugin"],
      name: "RolePlugin",
      requiredBlueprintPaths: ["permissions"],
      tasks: [
        {
          template: "role/roles.ts.tpl",
          output: "modules/{{names.module.kebab}}/security/roles.ts"
        }
      ]
    });
  }
}
