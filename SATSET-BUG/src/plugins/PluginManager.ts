import type { IPlugin } from "./IPlugin.js";

export class PluginManager {
  private readonly plugins = new Map<string, IPlugin>();

  register(plugin: IPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Duplicate plugin id ${plugin.id}`);
    }

    this.plugins.set(plugin.id, plugin);
  }

  unregister(id: string): void {
    this.plugins.delete(id);
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }

  get(id: string): IPlugin | undefined {
    return this.plugins.get(id);
  }

  list(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  registerAll(): void {
    for (const plugin of this.plugins.values()) {
      plugin.register();
    }
  }
}
