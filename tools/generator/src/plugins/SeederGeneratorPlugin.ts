import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class SeederGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "seeder"],
      dependencies: ["SeedPlugin", "TestGenerator"],
      description: "Generate CRUD seeder for entity module.",
      name: "SeederGenerator",
      priority: 850,
      tasks: [{
        template: "crud-universal/seeder.ts.tpl",
        output: paths.seeder
      }]
    }));
  }
}
