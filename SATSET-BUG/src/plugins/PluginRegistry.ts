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

  public registerIfMissing(plugin: {
    id: string;
    manifest: PluginManifest;
    module: PluginModule;
    enabled?: boolean;
  }): boolean {
    if (this.plugins.has(plugin.id)) {
      return false;
    }

    this.register(plugin.manifest, plugin.module, plugin.enabled ?? true);
    return true;
  }

  public get(id: string): PluginInstance | undefined {
    return this.plugins.get(id);
  }

  public list(): PluginInstance[] {
    return [...this.plugins.values()];
  }

  public validate(): string[] {
    const errors: string[] = [];
    const seenIds = new Set<string>();

    for (const [mapId, plugin] of this.plugins.entries()) {
      const id = (plugin.manifest.id ?? "").trim();
      const name = (plugin.manifest.name ?? "").trim();

      if (id.length === 0) {
        errors.push("Plugin id is empty");
      }

      if (name.length === 0) {
        errors.push(`Plugin name is empty for id '${mapId}'`);
      }

      if (seenIds.has(id)) {
        errors.push(`Duplicate plugin id '${id}'`);
      } else if (id.length > 0) {
        seenIds.add(id);
      }
    }

    return errors;
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
