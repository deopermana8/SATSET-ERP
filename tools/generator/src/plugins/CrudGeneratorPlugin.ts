import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

export default class CrudGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "orchestrator"],
      dependencies: ["IdentityGeneratorPlugin", "PrismaGenerator"],
      description: "Universal CRUD orchestrator plugin.",
      name: "CrudGenerator",
      priority: 980,
      tasks: []
    }));
  }
}
