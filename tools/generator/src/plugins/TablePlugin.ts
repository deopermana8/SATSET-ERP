import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class TablePlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity"],
      dependencies: ["FormPlugin"],
      name: "TablePlugin",
      requiredBlueprintPaths: ["fields"],
      tasks: [
        {
          template: "table/table.ts.tpl",
          output: "modules/{{names.module.kebab}}/ui/{{names.entity.pascal}}Table.ts"
        }
      ]
    });
  }
}
