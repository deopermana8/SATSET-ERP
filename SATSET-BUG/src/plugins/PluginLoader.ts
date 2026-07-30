import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { IPlugin } from "./IPlugin.js";
import type { PluginManifest } from "./PluginManifest.js";
import type { PluginEngine } from "./PluginEngine.js";
import type { PluginPermission } from "./PluginPermission.js";
import { validatePluginManifest } from "./PluginManifestValidator.js";
import {
  PrismaPlugin,
  NextPlugin,
  ReactPlugin,
  TypeScriptPlugin,
} from "./DefaultPlugins.js";

export interface PluginModule {
  manifest: PluginManifest;
  register: (engine: PluginEngine) => void;
}

export type Plugin = IPlugin;

export class PluginLoader {
  constructor(private readonly baseDir: string) {}

  public async discoverPlugins(): Promise<Plugin[]> {
    const discovered: Plugin[] = [];

    discovered.push(
      new PrismaPlugin(),
      new NextPlugin(),
      new ReactPlugin(),
      new TypeScriptPlugin()
    );

    const pluginsDir = join(this.baseDir, "plugins");
    if (!existsSync(pluginsDir)) {
      return discovered;
    }

    const entries = readdirSync(pluginsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      try {
        const relativePluginPath = join("plugins", entry.name);
        const manifest = this.loadPluginManifest(relativePluginPath);
        await this.loadPlugin(relativePluginPath);
        discovered.push({
          id: manifest.id,
          name: manifest.name,
          register(): void {
            // Discovery only: plugin registration is handled by caller.
          },
        });
      } catch {
        // Ignore invalid plugins by design.
      }
    }

    return discovered;
  }

  public async loadPlugin(pluginPath: string): Promise<PluginModule> {
    const pluginDir = this.resolvePluginPath(pluginPath);
    const manifestPath = join(pluginDir, "plugin.json");
    if (!existsSync(manifestPath)) {
      throw new Error(`Plugin manifest not found: ${manifestPath}`);
    }

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
    this.validateManifest(manifest, manifestPath);
    const pluginFile = join(pluginDir, "index.js");

    if (!existsSync(pluginFile)) {
      throw new Error(`Plugin entrypoint not found: ${pluginFile}`);
    }

    const imported = (await import(pathToFileURL(pluginFile).href)) as { default?: PluginModule } | PluginModule;
    const resolved = "default" in imported && imported.default ? imported.default : imported;
    const plugin = resolved as PluginModule;

    if (!plugin || typeof plugin.register !== "function") {
      throw new Error(`Plugin entrypoint does not export a valid register function: ${pluginFile}`);
    }

    return {
      manifest: manifest as unknown as PluginManifest,
      register: plugin.register,
    };
  }

  public loadPluginManifest(pluginPath: string): PluginManifest {
    const pluginDir = this.resolvePluginPath(pluginPath);
    const manifestPath = join(pluginDir, "plugin.json");
    if (!existsSync(manifestPath)) {
      throw new Error(`Plugin manifest not found: ${manifestPath}`);
    }

    const raw = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
    this.validateManifest(raw, manifestPath);
    return raw as unknown as PluginManifest;
  }

  public ensurePluginDirectory(pluginPath: string): void {
    mkdirSync(join(this.baseDir, pluginPath), { recursive: true });
  }

  public async loadAll(pluginEngine: PluginEngine): Promise<void> {
    const pluginsDir = join(this.baseDir, "plugins");
    if (!existsSync(pluginsDir)) {
      return;
    }

    const entries = readdirSync(pluginsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      try {
        const relPath = join("plugins", entry.name);
        const manifestPath = join(this.baseDir, "plugins", entry.name, "plugin.json");
        if (!existsSync(manifestPath)) {
          console.warn(`[PluginLoader] skipping "${entry.name}": manifest.json not found`);
          continue;
        }
        const raw = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
        const validation = validatePluginManifest(raw);
        if (!validation.valid) {
          console.warn(`[PluginLoader] skipping "${entry.name}": ${validation.errors.join(", ")}`);
          continue;
        }
        const manifest = this.loadPluginManifest(relPath);
        const pluginModule = await this.loadPlugin(relPath);
        pluginEngine.register({
          id: manifest.id,
          name: manifest.name,
          register: () => pluginModule.register(pluginEngine),
        });
      } catch (err) {
        console.warn(`[PluginLoader] skipping plugin "${entry.name}": ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  public getPermissions(manifest: PluginManifest): PluginPermission[] {
    return (manifest.permissions ?? []) as PluginPermission[];
  }

  private validateManifest(raw: Record<string, unknown>, source: string): void {
    const required: Array<keyof PluginManifest> = ["id", "name", "version", "description", "author", "capabilities"];
    for (const field of required) {
      if (raw[field] === undefined || raw[field] === null || raw[field] === "") {
        throw new Error(`Plugin manifest missing required field "${field}": ${source}`);
      }
    }
    if (!Array.isArray(raw["capabilities"])) {
      throw new Error(`Plugin manifest field "capabilities" must be an array: ${source}`);
    }
  }

  private resolvePluginPath(pluginPath: string): string {
    const directPath = join(this.baseDir, pluginPath);
    if (existsSync(directPath)) {
      return directPath;
    }

    return join(this.baseDir, "plugins", pluginPath);
  }
}
