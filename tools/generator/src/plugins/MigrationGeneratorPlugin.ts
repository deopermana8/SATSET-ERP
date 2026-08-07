import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class MigrationGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "migration"],
      dependencies: ["MigrationPlugin", "RepositoryGenerator"],
      description: "Generate migration script for CRUD entity module.",
      name: "MigrationGenerator",
      priority: 960,
      tasks: [{
        template: "crud-universal/migration.sql.tpl",
        output: paths.migration
      }]
    }));
  }
}
