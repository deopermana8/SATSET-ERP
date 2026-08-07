import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class PermissionPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "dashboard", "report"],
      dependencies: ["MenuPlugin"],
      name: "PermissionPlugin",
      requiredBlueprintPaths: ["permissions"],
      tasks: [
        {
          template: "permission/permissions.ts.tpl",
          output: "modules/{{names.module.kebab}}/security/permissions.ts"
        },
        {
          // workspace-level RBAC integration — re-exports PERMISSION_DEFINITIONS
          template: "permission/permissions.ts.tpl",
          output: "lib/rbac/permissions.ts"
        }
      ]
    });
  }
}
