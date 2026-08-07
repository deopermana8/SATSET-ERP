import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class TableGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "table"],
      dependencies: ["TablePlugin", "PageGenerator"],
      description: "Generate list table component for CRUD entity module.",
      name: "TableGenerator",
      priority: 870,
      tasks: [{
        template: "crud-universal/table.tsx.tpl",
        output: paths.table
      }]
    }));
  }
}
