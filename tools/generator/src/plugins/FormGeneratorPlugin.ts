import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class FormGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "form"],
      dependencies: ["FormPlugin", "TableGenerator"],
      description: "Generate create/edit form component for CRUD entity module.",
      name: "FormGenerator",
      priority: 880,
      tasks: [{
        template: "crud-universal/form.tsx.tpl",
        output: paths.form
      }]
    }));
  }
}
