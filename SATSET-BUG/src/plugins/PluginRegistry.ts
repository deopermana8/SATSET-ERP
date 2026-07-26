import type { PluginManifest } from "./PluginManifest.js";
import type { PluginEngine } from "./PluginEngine.js";
import type { PluginModule } from "./PluginLoader.js";

export interface PluginInstance {
  manifest: PluginManifest;
  module: PluginModule;
  enabled: boolean;
  loaded: boolean;
}

export class PluginRegistry {
  private readonly plugins = new Map<string, PluginInstance>();

  public register(manifest: PluginManifest, module: PluginModule, enabled = true): void {
    this.plugins.set(manifest.id, {
      manifest,
      module,
      enabled,
      loaded: false,
    });
  }

  public get(id: string): PluginInstance | undefined {
    return this.plugins.get(id);
  }

  public list(): PluginInstance[] {
    return [...this.plugins.values()];
  }

  public enable(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = true;
    }
  }

  public disable(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = false;
    }
  }

  public async load(id: string, engine: PluginEngine): Promise<PluginInstance | undefined> {
    const plugin = this.plugins.get(id);
    if (!plugin || !plugin.enabled) {
      return undefined;
    }

    plugin.module.register(engine);
    plugin.loaded = true;
    return plugin;
  }
}
