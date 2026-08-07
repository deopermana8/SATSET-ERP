import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class FormPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "entity"],
      dependencies: ["ActionPlugin"],
      name: "FormPlugin",
      requiredBlueprintPaths: ["fields"],
      tasks: [
        {
          template: "form/form.ts.tpl",
          output: "modules/{{names.module.kebab}}/ui/{{names.entity.pascal}}Form.ts"
        }
      ]
    });
  }
}
