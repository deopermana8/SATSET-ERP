import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class RepositoryGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "repository"],
      dependencies: ["RepositoryPlugin", "ServiceGenerator"],
      description: "Generate repository contract for CRUD entity module.",
      name: "RepositoryGenerator",
      priority: 950,
      tasks: [{
        template: "crud-universal/repository.ts.tpl",
        output: paths.repository
      }]
    }));
  }
}
