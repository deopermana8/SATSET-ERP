import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class HookGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "hook"],
      dependencies: ["ValidationGenerator"],
      description: "Generate reusable data hook for CRUD entity module.",
      name: "HookGenerator",
      priority: 910,
      tasks: [{
        template: "crud-universal/hook.ts.tpl",
        output: paths.hook
      }]
    }));
  }
}
