import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class ServiceGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "service"],
      dependencies: ["ServicePlugin", "ApiRouteGenerator"],
      description: "Generate service layer for CRUD entity module.",
      name: "ServiceGenerator",
      priority: 940,
      tasks: [{
        template: "crud-universal/service.ts.tpl",
        output: paths.service
      }]
    }));
  }
}
