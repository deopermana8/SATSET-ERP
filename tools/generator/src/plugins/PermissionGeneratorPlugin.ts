import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class PermissionGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "permission"],
      dependencies: ["PermissionPlugin", "FormGenerator"],
      description: "Generate permission constants and guard contracts for CRUD entity module.",
      name: "PermissionGenerator",
      priority: 890,
      tasks: [{
        template: "crud-universal/permission.ts.tpl",
        output: paths.permission
      }]
    }));
  }
}
