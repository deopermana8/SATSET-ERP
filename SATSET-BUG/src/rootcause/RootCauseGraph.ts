import type { Issue } from "../core/Issue.js";

export type NodeId = string;

export interface GraphNode {
  id: NodeId;
  issue: Issue;
}

export interface GraphEdge {
  from: NodeId;
  to: NodeId;
  weight: number;
}

export class RootCauseGraph {
  private nodes: Map<NodeId, GraphNode> = new Map();
  private edges: Map<NodeId, Map<NodeId, number>> = new Map();

  addIssue(issue: Issue): void {
    const id = issue.id;
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id, issue });
    }
  }

  connect(a: NodeId, b: NodeId, weight = 1): void {
    if (a === b) return;
    if (!this.edges.has(a)) this.edges.set(a, new Map());
    const row = this.edges.get(a)!;
    row.set(b, Math.max(row.get(b) ?? 0, weight));
    if (!this.edges.has(b)) this.edges.set(b, new Map());
    const rowb = this.edges.get(b)!;
    rowb.set(a, Math.max(rowb.get(a) ?? 0, weight));
  }

  getNodeIds(): NodeId[] {
    return Array.from(this.nodes.keys());
  }

  getNode(id: NodeId): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getNeighbors(id: NodeId): NodeId[] {
    const row = this.edges.get(id);
    if (!row) return [];
    return Array.from(row.keys());
  }

  // Connected components using BFS
  connectedComponents(): NodeId[][] {
    const seen = new Set<NodeId>();
    const comps: NodeId[][] = [];
    for (const id of this.getNodeIds()) {
      if (seen.has(id)) continue;
      const comp: NodeId[] = [];
      const q: NodeId[] = [id];
      seen.add(id);
      while (q.length > 0) {
        const cur = q.shift()!;
        comp.push(cur);
        for (const nb of this.getNeighbors(cur)) {
          if (!seen.has(nb)) {
            seen.add(nb);
            q.push(nb);
          }
        }
      }
      comps.push(comp);
    }
    return comps;
  }

  getIssuesForComponent(component: NodeId[]): Issue[] {
    const issues: Issue[] = [];
    for (const id of component) {
      const node = this.getNode(id);
      if (node) issues.push(node.issue);
    }
    return issues;
  }
}

export default RootCauseGraph;
