import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { EventBus } from "../doctor/EventBus.js";
import type { IPlugin } from "./IPlugin.js";
import { PluginLoader } from "./PluginLoader.js";
import { PluginManager } from "./PluginManager.js";
import type { PluginManifest } from "./PluginManifest.js";
import { PluginSandbox } from "./PluginSandbox.js";
import { PluginRegistry, type PluginInstance } from "./PluginRegistry.js";

export class PluginEngine implements IEngine {
  public readonly name = "PluginEngine";
  private readonly manager: PluginManager;
  private readonly loader: PluginLoader;
  private readonly registry: PluginRegistry;
  private readonly eventBus?: EventBus;
  private readonly discoveredPlugins: PluginInstance[] = [];
  private readonly pluginManifests: Map<string, PluginManifest> = new Map();
  private builtinPluginsLoaded = false;

  constructor(manager?: PluginManager, options: { loader?: PluginLoader; registry?: PluginRegistry; eventBus?: EventBus } = {}) {
    this.manager = manager ?? new PluginManager();
    this.loader = options.loader ?? new PluginLoader(process.cwd());
    this.registry = options.registry ?? new PluginRegistry();
    this.eventBus = options.eventBus;
  }

  register(plugin: IPlugin): void {
    this.manager.register(plugin);
  }

  registerIfMissing(plugin: IPlugin): boolean {
    if (this.manager.has(plugin.id)) {
      return false;
    }

    this.manager.register(plugin);
    return true;
  }

  getRegistry(): PluginRegistry {
    return this.registry;
  }

  listPlugins(): PluginManifest[] {
    return Array.from(this.pluginManifests.values());
  }

  async reload(pluginId: string): Promise<boolean> {
    const manifest = this.pluginManifests.get(pluginId);
    if (!manifest) {
      return false;
    }

    this.manager.unregister(pluginId);
    this.pluginManifests.delete(pluginId);

    const sandbox = new PluginSandbox();
    await sandbox.run(pluginId, "load", async () => {
      const pluginModule = await this.loader.loadPlugin(path.join("plugins", pluginId));
      const plugin = {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        manifest,
        register: () => pluginModule.register(this),
      };
      this.manager.register(plugin);
      this.pluginManifests.set(manifest.id, manifest);
    });

    return sandbox.getFailures().length === 0;
  }

  async reloadAll(): Promise<void> {
    const ids = Array.from(this.pluginManifests.keys());
    for (const id of ids) {
      await this.reload(id);
    }
  }

  async loadBuiltinPlugins(): Promise<void> {
    if (this.builtinPluginsLoaded) {
      return;
    }

    const builtinPluginsDir = path.resolve(process.cwd(), "src", "plugins");
    if (!fs.existsSync(builtinPluginsDir)) {
      this.builtinPluginsLoaded = true;
      return;
    }

    const entries = fs.readdirSync(builtinPluginsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".js")) {
        continue;
      }

      if (entry.name.endsWith(".d.ts")) {
        continue;
      }

      const filePath = path.join(builtinPluginsDir, entry.name);
      try {
        const imported = (await import(pathToFileURL(filePath).href)) as Record<string, unknown>;
        for (const value of Object.values(imported)) {
          if (typeof value !== "function") {
            continue;
          }

          const candidate = value as { prototype?: { register?: unknown }; new (): unknown };
          if (!candidate.prototype || typeof candidate.prototype.register !== "function") {
            continue;
          }

          let pluginInstance: unknown;
          try {
            pluginInstance = new candidate();
          } catch {
            continue;
          }

          const plugin = pluginInstance as Partial<IPlugin>;
          if (typeof plugin.id !== "string" || plugin.id.length === 0) {
            continue;
          }

          if (typeof plugin.name !== "string" || typeof plugin.register !== "function") {
            continue;
          }

          if (this.manager.has(plugin.id)) {
            continue;
          }

          try {
            this.manager.register(plugin as IPlugin);
          } catch {
            // ignore duplicate ids and invalid plugin registrations
          }
        }
      } catch {
        // ignore invalid plugin modules
      }
    }

    this.builtinPluginsLoaded = true;
  }

  async loadPlugins(projectRoot: string, context?: Context): Promise<PluginInstance[]> {
    await this.loadBuiltinPlugins();

    const pluginsDir = path.join(projectRoot, "plugins");
    if (!fs.existsSync(pluginsDir)) {
      return [];
    }

    const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const sandbox = new PluginSandbox();
      await sandbox.run(entry.name, "load", async () => {
        const manifest = this.loader.loadPluginManifest(entry.name);
        if (this.manager.has(manifest.id)) {
          return;
        }
        const pluginModule = await this.loader.loadPlugin(entry.name);
        const plugin = {
          id: manifest.id,
          name: manifest.name,
          version: manifest.version,
          manifest,
          register: () => pluginModule.register(this),
        };

        await sandbox.run(manifest.id, "register", () => {
          this.manager.register(plugin);
          this.pluginManifests.set(manifest.id, manifest);
          this.registry.register(manifest, pluginModule, manifest.enabled !== false);
        });

        await this.registry.load(manifest.id, this);
        this.discoveredPlugins.push(this.registry.get(manifest.id)!);
        this.eventBus?.emitLifecycle("PLUGIN_LOADED", manifest.id, "plugin", { projectRoot, permissions: manifest.permissions });

        if (context) {
          (context.metadata as Record<string, unknown>).plugins = [
            ...(((context.metadata as Record<string, unknown>).plugins as Array<Record<string, unknown>>) ?? []),
            { id: manifest.id, name: manifest.name, version: manifest.version },
          ];
        }
      });

      if (sandbox.getFailures().length > 0) {
        this.eventBus?.emitLifecycle("PLUGIN_FAILED", entry.name, "plugin", { projectRoot, error: sandbox.getFailures()[0]!.error });
      }
    }

    return this.discoveredPlugins;
  }

  async run(context: Context): Promise<void> {
    await this.loadPlugins(context.projectRoot, context);
  }
}
