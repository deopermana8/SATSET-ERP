import type { PluginEngine } from "../plugins/PluginEngine.js";
import {
  PrismaPlugin,
  NextPlugin,
  ReactPlugin,
  TypeScriptPlugin,
} from "../plugins/DefaultPlugins.js";

export function registerDefaultPlugins(pluginEngine: PluginEngine): void {
  pluginEngine.register(new PrismaPlugin());
  pluginEngine.registerIfMissing(new NextPlugin());
  pluginEngine.registerIfMissing(new ReactPlugin());
  pluginEngine.registerIfMissing(new TypeScriptPlugin());
}
