import type { PluginManifest } from "./PluginManifest.js";
import type { PluginEngine } from "./PluginEngine.js";

export interface IPlugin {
  name: string;
  version: string;
  manifest: PluginManifest;
  register(engine: PluginEngine): void;
}
