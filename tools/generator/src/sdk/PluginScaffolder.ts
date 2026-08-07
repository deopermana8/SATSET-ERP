import { FileSystem } from "../utils/FileSystem.js";
import { path } from "../utils/Node.js";
import { TemplateRenderer } from "../core/TemplateRenderer.js";
import { PluginScaffoldRequest } from "./contracts.js";

export interface IPluginScaffolder {
  scaffold(request: PluginScaffoldRequest): string;
}

export class PluginScaffolder implements IPluginScaffolder {
  private readonly fileSystem = new FileSystem();
  private readonly renderer = new TemplateRenderer();

  scaffold(request: PluginScaffoldRequest): string {
    const templatePath = path.join(request.generatorRoot, "templates", "sdk", "plugin.ts.tpl");
    const templateContent = this.fileSystem.readText(templatePath);
    const className = request.className.endsWith("Plugin") ? request.className : `${request.className}Plugin`;
    const outputPath = path.join(request.generatorRoot, "src", "plugins", `${className}.ts`);
    const content = this.renderer.render(templateContent, {
      className,
      pluginName: className,
      outputName: className.replace(/Plugin$/, "").toLowerCase()
    });

    this.fileSystem.writeText(outputPath, `${content.trim()}\n`);
    return outputPath;
  }
}
