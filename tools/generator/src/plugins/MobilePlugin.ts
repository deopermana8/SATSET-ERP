import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class MobilePlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "mobile"],
      dependencies: ["FormPlugin"],
      name: "MobilePlugin",
      requiredBlueprintPaths: ["mobile.screen"],
      tasks: [
        {
          template: "mobile/mobile.ts.tpl",
          output: "modules/{{names.module.kebab}}/mobile/{{blueprint.mobile.screen}}.ts"
        }
      ]
    });
  }
}
