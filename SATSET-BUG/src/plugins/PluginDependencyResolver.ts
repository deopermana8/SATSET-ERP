export interface DependencyResolveResult {
  valid: boolean;
  order: string[];
  errors: string[];
}

export class PluginDependencyResolver {
  resolve(plugins: ReadonlyArray<{ id: string; dependencies: string[] }>): DependencyResolveResult {
    const errors: string[] = [];
    const ids = new Set(plugins.map((p) => p.id));

    for (const plugin of plugins) {
      for (const dep of plugin.dependencies) {
        if (!ids.has(dep)) {
          errors.push(`plugin "${plugin.id}" has missing dependency: "${dep}"`);
        }
      }
    }

    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (id: string): boolean => {
      if (visited.has(id)) return true;
      if (visiting.has(id)) {
        errors.push(`circular dependency detected at: "${id}"`);
        return false;
      }
      visiting.add(id);
      const plugin = plugins.find((p) => p.id === id);
      if (plugin) {
        for (const dep of plugin.dependencies) {
          if (ids.has(dep) && !visit(dep)) return false;
        }
      }
      visiting.delete(id);
      visited.add(id);
      order.push(id);
      return true;
    };

    for (const plugin of plugins) {
      visit(plugin.id);
    }

    return { valid: errors.length === 0, order, errors };
  }
}
