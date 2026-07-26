import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { PluginManifest } from "./PluginManifest.js";
import type { PluginEngine } from "./PluginEngine.js";
import type { PluginPermission } from "./PluginPermission.js";

export interface PluginModule {
  manifest: PluginManifest;
  register: (engine: PluginEngine) => void;
}

export class PluginLoader {
  constructor(private readonly baseDir: string) {}

  public async loadPlugin(pluginPath: string): Promise<PluginModule> {
    const manifestPath = join(this.baseDir, pluginPath, "plugin.json");
    if (!existsSync(manifestPath)) {
      throw new Error(`Plugin manifest not found: ${manifestPath}`);
    }

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as PluginManifest;
    const pluginFile = join(this.baseDir, pluginPath, "index.js");

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
      manifest,
      register: plugin.register,
    };
  }

  public loadPluginManifest(pluginPath: string): PluginManifest {
    const manifestPath = join(this.baseDir, pluginPath, "plugin.json");
    if (!existsSync(manifestPath)) {
      throw new Error(`Plugin manifest not found: ${manifestPath}`);
    }

    return JSON.parse(readFileSync(manifestPath, "utf8")) as PluginManifest;
  }

  public ensurePluginDirectory(pluginPath: string): void {
    mkdirSync(join(this.baseDir, pluginPath), { recursive: true });
  }

  public getPermissions(manifest: PluginManifest): PluginPermission[] {
    return (manifest.permissions ?? []) as PluginPermission[];
  }
}
