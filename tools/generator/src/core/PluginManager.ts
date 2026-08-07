import { Context } from "./Context.js";
import { GeneratorPlugin, GeneratorRunResult } from "../sdk/contracts.js";

export interface IPluginManager {
  run(context: Context, plugins: readonly GeneratorPlugin[]): Promise<GeneratorRunResult>;
}

export class PluginManager implements IPluginManager {
  async run(context: Context, plugins: readonly GeneratorPlugin[]): Promise<GeneratorRunResult> {
    const artifacts = [] as GeneratorRunResult["artifacts"];
    const pluginOrder = plugins.map((plugin) => plugin.manifest.name);

    for (const plugin of plugins) {
      await plugin.validate(context);
      await plugin.beforeGenerate(context);
      const pluginArtifacts = await plugin.generate(context);
      artifacts.push(...pluginArtifacts);
      await plugin.afterGenerate(context, {
        artifacts,
        pluginOrder
      });
    }

    return {
      artifacts,
      pluginOrder
    };
  }
}
