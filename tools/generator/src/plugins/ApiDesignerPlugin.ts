import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { NormalizedBlueprint } from "../sdk/contracts.js";

export default class ApiDesignerPlugin extends TemplatePlugin {
  constructor() {
    super({
      manifest: {
        capabilities: ["api", "module"],
        dependencies: ["ApiPlugin", "RepositoryPlugin", "ServicePlugin", "PermissionPlugin", "DocumentationPlugin"],
        description: "Design CRUD API, validation, repository, service, permission, audit, and documentation.",
        name: "ApiDesignerPlugin",
        priority: 220,
        targets: ["module", "entity", "report"],
        version: "3.0.0"
      },
      tasks: [
        {
          template: "api/api-design.md.tpl",
          output: "modules/{{names.module.kebab}}/api/{{names.entity.pascal}}ApiDesign.md"
        }
      ]
    });
  }

  async enrichBlueprint(blueprint: NormalizedBlueprint): Promise<NormalizedBlueprint> {
    if (blueprint.api.length > 0) {
      return blueprint;
    }

    return {
      ...blueprint,
      api: [
        { method: "GET", name: "list", path: `/api/${blueprint.module.toLowerCase()}`, permission: `${blueprint.module.toLowerCase()}.read` },
        { method: "POST", name: "create", path: `/api/${blueprint.module.toLowerCase()}`, permission: `${blueprint.module.toLowerCase()}.write` }
      ]
    };
  }
}
