export interface DependencyNode {
  id: string;
  dependencies: string[];
}

export class DependencyGraph {
  private readonly nodes = new Map<string, DependencyNode>();

  addNode(id: string, dependencies: string[] = []): void {
    this.nodes.set(id, { id, dependencies });
  }

  getRunnable(ids: string[]): string[] {
    const remaining = new Set(ids);
    const runnable: string[] = [];

    for (const id of ids) {
      const node = this.nodes.get(id);
      if (!node) {
        continue;
      }
      const satisfied = node.dependencies.every((dependency) => !remaining.has(dependency));
      if (satisfied) {
        runnable.push(id);
      }
    }

    return runnable;
  }
}
