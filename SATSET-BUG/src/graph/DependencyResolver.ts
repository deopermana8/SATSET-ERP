import type { Context } from "../core/Context.js";
import type { DependencyNode } from "./DependencyNode.js";
import { DepNode } from "./DependencyNode.js";
import DependencyGraph from "./DependencyGraph.js";
import type { Issue } from "../core/Issue.js";

export class DependencyResolver {
  private readonly graph: DependencyGraph;

  constructor(graph?: DependencyGraph) {
    this.graph = graph ?? new DependencyGraph();
  }

  buildFromContext(context: Context): DependencyGraph {
    const projectId = `project:${context.projectName}`;
    if (!this.graph.hasNode(projectId)) {
      this.graph.addNode(new DepNode(projectId, "project", context.projectName, { root: context.projectRoot }));
    }

    const meta = (context.metadata as unknown as Record<string, unknown>) ?? {};
    const pkg = meta.packageJson as Record<string, unknown> | undefined;
    const deps = (pkg?.dependencies as Record<string, string> | undefined) ?? {};
    const dev = (pkg?.devDependencies as Record<string, string> | undefined) ?? {};

    for (const name of Object.keys({ ...deps, ...dev })) {
      const id = `dep:${name}`;
      if (!this.graph.hasNode(id)) this.graph.addNode(new DepNode(id, "dependency", name));
      this.graph.addEdge(projectId, id, 5);
    }

    return this.graph;
  }

  addIssues(issues: readonly Issue[]): void {
    for (const issue of issues) {
      const id = `issue:${issue.id}`;
      if (!this.graph.hasNode(id)) this.graph.addNode(new DepNode(id, "issue", issue.title ?? issue.message ?? issue.id, { file: issue.file }));

      // heuristics: if issue.file references a dependency name, link that dependency -> issue
      if (issue.file) {
        const file = issue.file.toLowerCase();
        for (const node of this.graph.getNodes()) {
          if (node.name && node.type === "dependency" && file.includes(node.name.toLowerCase())) {
            this.graph.addEdge(`dep:${node.name}`, id, 4);
          }
        }
      }
    }
  }

  connectSequentialIssues(issueIds: string[]): void {
    for (let i = 0; i < issueIds.length - 1; i++) {
      const a = `issue:${issueIds[i]}`;
      const b = `issue:${issueIds[i + 1]}`;
      if (this.graph.hasNode(a) && this.graph.hasNode(b)) this.graph.addEdge(a, b, 8);
    }
  }

  resolveCausality(): void {
    // simple transitive closure: if dep -> issueA and issueA -> issueB then link dep -> issueB
    const edges = this.graph.getEdges();
    for (const e of edges) {
      // for each edge a->b, for neighbors of b, add a->neighbor
      const neighbors = this.graph.getNeighbors(e.to);
      for (const nb of neighbors) {
        this.graph.addEdge(e.from, nb, Math.max(1, e.weight - 1));
      }
    }
  }

  getGraph(): DependencyGraph {
    return this.graph;
  }
}

export default DependencyResolver;
