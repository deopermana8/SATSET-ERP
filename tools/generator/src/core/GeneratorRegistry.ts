import { GeneratorPlugin } from "../sdk/contracts.js";
import { FileSystem } from "../utils/FileSystem.js";
import { getFastGlob, path } from "../utils/Node.js";
import { Logger } from "./Logger.js";

interface PluginModule {
  default?: new () => GeneratorPlugin;
  [key: string]: unknown;
}

export interface IGeneratorRegistry {
  discover(pluginRoot: string): Promise<GeneratorPlugin[]>;
}

export class GeneratorRegistry implements IGeneratorRegistry {
  private readonly cache = new Map<string, GeneratorPlugin[]>();
  private readonly fileSystem = new FileSystem();

  constructor(private readonly logger: Logger) {}

  async discover(pluginRoot: string): Promise<GeneratorPlugin[]> {
    if (!this.fileSystem.exists(pluginRoot)) {
      return [];
    }

    const cached = this.cache.get(pluginRoot);
    if (cached) {
      return cached;
    }

    const fastGlob = getFastGlob();
    const pluginFiles = await fastGlob(["**/*Plugin.{js,ts}"], {
      absolute: true,
      cwd: pluginRoot,
      dot: false,
      ignore: [],
      onlyFiles: true,
      suppressErrors: true,
      unique: true
    });
    const plugins: GeneratorPlugin[] = [];

    for (const pluginFile of pluginFiles.sort()) {
      if (path.basename(pluginFile).startsWith("Base")) {
        continue;
      }

      const pluginModule = require(pluginFile) as PluginModule;
      const pluginClass = this.resolvePluginClass(pluginModule);
      if (!pluginClass) {
        continue;
      }

      const plugin = new pluginClass();
      this.logger.log("debug", `Discovered plugin ${plugin.manifest.name} from ${pluginFile}`);
      plugins.push(plugin);
    }

    this.cache.set(pluginRoot, plugins);
    return plugins;
  }

  private resolvePluginClass(moduleValue: PluginModule): (new () => GeneratorPlugin) | undefined {
    if (moduleValue.default) {
      return moduleValue.default;
    }

    for (const key of Object.keys(moduleValue)) {
      const candidate = moduleValue[key];
      if (typeof candidate === "function") {
        return candidate as new () => GeneratorPlugin;
      }
    }

    return undefined;
  }
}
