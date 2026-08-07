import { GeneratorPlugin } from "../sdk/contracts.js";

export interface DependencyGraphNode {
  dependencies: readonly string[];
  name: string;
  priority: number;
}

export interface IDependencyGraph {
  build(plugins: readonly GeneratorPlugin[]): DependencyGraphNode[];
  detectCycles(plugins: readonly GeneratorPlugin[]): string[];
}

export class DependencyGraph implements IDependencyGraph {
  build(plugins: readonly GeneratorPlugin[]): DependencyGraphNode[] {
    return plugins.map((plugin) => ({
      dependencies: plugin.dependencies(),
      name: plugin.manifest.name,
      priority: plugin.manifest.priority
    }));
  }

  detectCycles(plugins: readonly GeneratorPlugin[]): string[] {
    const graph = new Map(plugins.map((plugin) => [plugin.manifest.name, plugin.dependencies()]));
    const visited = new Set<string>();
    const active = new Set<string>();
    const cycles: string[] = [];

    const visit = (name: string): void => {
      if (active.has(name)) {
        cycles.push(name);
        return;
      }

      if (visited.has(name)) {
        return;
      }

      visited.add(name);
      active.add(name);
      for (const dependency of graph.get(name) ?? []) {
        visit(dependency);
      }
      active.delete(name);
    };

    for (const name of graph.keys()) {
      visit(name);
    }

    return Array.from(new Set(cycles));
  }
}
