import type { DependencyNode } from "./DependencyNode.js";

export interface Edge {
  from: string;
  to: string;
  weight: number;
}

export class DependencyGraph {
  private nodes: Map<string, DependencyNode> = new Map();
  private edges: Map<string, Map<string, number>> = new Map();

  addNode(node: DependencyNode): void {
    this.nodes.set(node.id, node);
  }

  getNode(id: string): DependencyNode | undefined {
    return this.nodes.get(id);
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  addEdge(from: string, to: string, weight = 1): void {
    if (!this.nodes.has(from) || !this.nodes.has(to)) return;
    if (!this.edges.has(from)) this.edges.set(from, new Map());
    this.edges.get(from)!.set(to, Math.max(this.edges.get(from)!.get(to) ?? 0, weight));
  }

  getNeighbors(id: string): string[] {
    const row = this.edges.get(id);
    if (!row) return [];
    return Array.from(row.keys());
  }

  getPredecessors(id: string): string[] {
    const preds: string[] = [];
    const edgeEntries = Array.from(this.edges.entries());
    for (let entryIndex = 0; entryIndex < edgeEntries.length; entryIndex += 1) {
      const from = edgeEntries[entryIndex][0];
      const row = edgeEntries[entryIndex][1];
      if (row.has(id)) preds.push(from);
    }
    return preds;
  }

  findPath(start: string, end: string, maxDepth = 10): string[] | null {
    if (start === end) return [start];
    const q: { node: string; path: string[] }[] = [{ node: start, path: [start] }];
    const seen = new Set<string>([start]);
    while (q.length > 0) {
      const { node, path } = q.shift()!;
      if (path.length > maxDepth) continue;
      for (const nb of this.getNeighbors(node)) {
        if (nb === end) return [...path, nb];
        if (!seen.has(nb)) {
          seen.add(nb);
          q.push({ node: nb, path: [...path, nb] });
        }
      }
    }
    return null;
  }

  reachableFrom(id: string): Set<string> {
    const result = new Set<string>();
    const q: string[] = [id];
    while (q.length > 0) {
      const cur = q.shift()!;
      for (const nb of this.getNeighbors(cur)) {
        if (!result.has(nb)) {
          result.add(nb);
          q.push(nb);
        }
      }
    }
    return result;
  }

  // Return all edges
  getEdges(): Edge[] {
    const out: Edge[] = [];
    const edgeEntries = Array.from(this.edges.entries());
    for (let entryIndex = 0; entryIndex < edgeEntries.length; entryIndex += 1) {
      const from = edgeEntries[entryIndex][0];
      const row = edgeEntries[entryIndex][1];
      const rowEntries = Array.from(row.entries());
      for (let rowIndex = 0; rowIndex < rowEntries.length; rowIndex += 1) {
        const to = rowEntries[rowIndex][0];
        const weight = rowEntries[rowIndex][1];
        out.push({ from, to, weight });
      }
    }
    return out;
  }

  getNodes(): DependencyNode[] {
    return Array.from(this.nodes.values());
  }
}

export default DependencyGraph;
