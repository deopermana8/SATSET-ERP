import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class {{className}} extends TemplatePlugin {
  constructor() {
    super({
      capabilities: ["module"],
      dependencies: ["DocumentationPlugin"],
      name: "{{pluginName}}",
      tasks: [
        {
          template: "documentation/readme.md.tpl",
          output: "modules/{{names.module.kebab}}/{{outputName}}/{{outputName}}.md"
        }
      ]
    });
  }
}
