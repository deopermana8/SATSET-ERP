import type { PluginEngine } from "../plugins/PluginEngine.js";
import { PluginLoader } from "../plugins/PluginLoader.js";

export async function bootstrapPluginLoading(pluginEngine: PluginEngine, projectRoot: string): Promise<void> {
  const loader = new PluginLoader(projectRoot);
  const plugins = await loader.discoverPlugins();

  for (const plugin of plugins) {
    try {
      pluginEngine.register(plugin);
    } catch {
      // Ignore duplicate or invalid registration errors by design.
    }
  }
}
