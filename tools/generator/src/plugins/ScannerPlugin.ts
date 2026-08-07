import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class ScannerPlugin extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module", "scanner"],
      dependencies: ["DocumentationPlugin"],
      name: "ScannerPlugin",
      requiredBlueprintPaths: ["scanner.provider", "scanner.schedule"],
      tasks: [
        {
          template: "scanner/scanner.json.tpl",
          output: "modules/{{names.module.kebab}}/scanner/{{names.module.kebab}}.scanner.json"
        }
      ]
    });
  }
}
