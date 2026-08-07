import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class ApiRouteGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "api-route"],
      dependencies: ["ApiPlugin", "ActionGenerator"],
      description: "Generate API route handlers for CRUD entity module.",
      name: "ApiRouteGenerator",
      priority: 930,
      tasks: [{
        template: "crud-universal/api-route.ts.tpl",
        output: paths.apiRoute
      }]
    }));
  }
}
