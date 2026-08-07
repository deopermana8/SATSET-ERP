import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class DocumentationGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "documentation"],
      dependencies: ["DocumentationPlugin"],
      description: "Generate CRUD module documentation and dependency chain notes.",
      name: "DocumentationGenerator",
      priority: 830,
      tasks: [{
        template: "crud-universal/documentation.md.tpl",
        output: paths.documentation
      }]
    }));
  }
}
