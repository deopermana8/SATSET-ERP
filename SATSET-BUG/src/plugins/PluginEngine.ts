import fs from "node:fs";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { EventBus } from "../doctor/EventBus.js";
import type { IPlugin } from "./IPlugin.js";
import { PluginLoader } from "./PluginLoader.js";
import { PluginManager } from "./PluginManager.js";
import { PluginRegistry, type PluginInstance } from "./PluginRegistry.js";

export class PluginEngine implements IEngine {
  public readonly name = "PluginEngine";
  private readonly manager: PluginManager;
  private readonly loader: PluginLoader;
  private readonly registry: PluginRegistry;
  private readonly eventBus?: EventBus;
  private readonly discoveredPlugins: PluginInstance[] = [];

  constructor(manager?: PluginManager, options: { loader?: PluginLoader; registry?: PluginRegistry; eventBus?: EventBus } = {}) {
    this.manager = manager ?? new PluginManager();
    this.loader = options.loader ?? new PluginLoader(process.cwd());
    this.registry = options.registry ?? new PluginRegistry();
    this.eventBus = options.eventBus;
  }

  register(plugin: IPlugin): void {
    this.manager.register(plugin);
  }

  getRegistry(): PluginRegistry {
    return this.registry;
  }

  async loadPlugins(projectRoot: string, context?: Context): Promise<PluginInstance[]> {
    const pluginsDir = path.join(projectRoot, "plugins");
    if (!fs.existsSync(pluginsDir)) {
      return [];
    }

    const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      try {
        const manifest = this.loader.loadPluginManifest(entry.name);
        const pluginModule = await this.loader.loadPlugin(entry.name);
        const plugin: IPlugin = {
          name: manifest.name,
          version: manifest.version,
          manifest,
          register: (engine) => pluginModule.register(engine),
        };

        this.manager.register(plugin);
        this.registry.register(manifest, pluginModule, manifest.enabled !== false);
        await this.registry.load(manifest.id, this);
        this.discoveredPlugins.push(this.registry.get(manifest.id)!);
        this.eventBus?.emitLifecycle("PLUGIN_LOADED", manifest.id, "plugin", { projectRoot, permissions: manifest.permissions });

        if (context) {
          (context.metadata as Record<string, unknown>).plugins = [
            ...(((context.metadata as Record<string, unknown>).plugins as Array<Record<string, unknown>>) ?? []),
            { id: manifest.id, name: manifest.name, version: manifest.version },
          ];
        }
      } catch (error) {
        this.eventBus?.emitLifecycle("PLUGIN_FAILED", entry.name, "plugin", { projectRoot, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return this.discoveredPlugins;
  }

  async run(context: Context): Promise<void> {
    await this.loadPlugins(context.projectRoot, context);
  }
}
