import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class ValidationGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "validation"],
      dependencies: ["PermissionGenerator"],
      description: "Generate validation helpers for CRUD entity module.",
      name: "ValidationGenerator",
      priority: 900,
      tasks: [{
        template: "crud-universal/validation.ts.tpl",
        output: paths.validation
      }]
    }));
  }
}
