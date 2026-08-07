import { GeneratorPlugin, GeneratorRunResult } from "../sdk/contracts.js";
import { Context } from "./Context.js";
import { PluginManager } from "./PluginManager.js";

export interface IPluginEngine {
  execute(context: Context, plugins: readonly GeneratorPlugin[]): Promise<GeneratorRunResult>;
}

export class PluginEngine implements IPluginEngine {
  constructor(private readonly pluginManager = new PluginManager()) {}

  async execute(context: Context, plugins: readonly GeneratorPlugin[]): Promise<GeneratorRunResult> {
    context.log("info", `Executing ${plugins.length} plugin(s)`);
    return this.pluginManager.run(context, plugins);
  }
}
