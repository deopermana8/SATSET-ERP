import { GeneratorPlugin } from "../sdk/contracts.js";

export interface IDependencyResolver {
  resolve(requestedPluginNames: readonly string[], availablePlugins: readonly GeneratorPlugin[]): GeneratorPlugin[];
}

export class DependencyResolver implements IDependencyResolver {
  resolve(requestedPluginNames: readonly string[], availablePlugins: readonly GeneratorPlugin[]): GeneratorPlugin[] {
    const pluginMap = new Map(availablePlugins.map((plugin) => [plugin.manifest.name, plugin]));
    const resolvedNames = new Set<string>();
    const visiting = new Set<string>();
    const ordered: GeneratorPlugin[] = [];

    for (const pluginName of requestedPluginNames) {
      this.visit(pluginName, pluginMap, visiting, resolvedNames, ordered);
    }

    return ordered;
  }

  private visit(
    pluginName: string,
    pluginMap: Map<string, GeneratorPlugin>,
    visiting: Set<string>,
    resolvedNames: Set<string>,
    ordered: GeneratorPlugin[]
  ): void {
    if (resolvedNames.has(pluginName)) {
      return;
    }

    if (visiting.has(pluginName)) {
      throw new Error(`Cyclic plugin dependency detected: ${pluginName}`);
    }

    const plugin = pluginMap.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin dependency not found: ${pluginName}`);
    }

    visiting.add(pluginName);
    for (const dependencyName of plugin.dependencies()) {
      this.visit(dependencyName, pluginMap, visiting, resolvedNames, ordered);
    }
    visiting.delete(pluginName);
    resolvedNames.add(pluginName);
    ordered.push(plugin);
    ordered.sort((left, right) => right.manifest.priority - left.manifest.priority);
  }
}
