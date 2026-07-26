import type { PluginEngine } from "./PluginEngine.js";
import type { IPlugin } from "./IPlugin.js";

export class PluginManager {
  private readonly plugins: IPlugin[] = [];

  register(plugin: IPlugin): void {
    this.plugins.push(plugin);
  }

  getPlugins(): IPlugin[] {
    return [...this.plugins];
  }

  loadAll(engine: PluginEngine): void {
    for (const plugin of this.plugins) {
      plugin.register(engine);
    }
  }
}
