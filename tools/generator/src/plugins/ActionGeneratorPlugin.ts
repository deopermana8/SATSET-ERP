import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class ActionGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "action"],
      dependencies: ["ActionPlugin", "HookGenerator"],
      description: "Generate action handlers for CRUD entity module.",
      name: "ActionGenerator",
      priority: 920,
      tasks: [
        {
          template: "crud-universal/actions.ts.tpl",
          output: paths.actions
        },
        {
          template: "crud-universal/actions.ts.tpl",
          output: paths.deleteHandler
        }
      ]
    }));
  }
}
