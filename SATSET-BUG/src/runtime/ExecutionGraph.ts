import type { IEngine } from "../core/IEngine.js";

export interface ExecutionNode {
  id: string;
  name: string;
  phase: "reasoning" | "planning" | "generation" | "compile" | "repair" | "benchmark" | "validation" | "knowledge" | "selfEvolution";
  dependencies: string[];
  parallelizable: boolean;
}

export interface ExecutionGraphSnapshot {
  nodes: ExecutionNode[];
  edges: Array<{ from: string; to: string }>;
}

export class ExecutionGraph {
  createGraph(engines: IEngine[]): ExecutionGraphSnapshot {
    const nodes: ExecutionNode[] = [
      { id: "reasoning", name: "Reasoning", phase: "reasoning", dependencies: [], parallelizable: false },
      { id: "planning", name: "Planning", phase: "planning", dependencies: ["reasoning"], parallelizable: false },
      { id: "generation", name: "Generation", phase: "generation", dependencies: ["planning"], parallelizable: true },
      { id: "compile", name: "Compile", phase: "compile", dependencies: ["generation"], parallelizable: false },
      { id: "repair", name: "Repair", phase: "repair", dependencies: ["compile"], parallelizable: false },
      { id: "benchmark", name: "Benchmark", phase: "benchmark", dependencies: ["repair"], parallelizable: false },
      { id: "validation", name: "Validation", phase: "validation", dependencies: ["benchmark"], parallelizable: false },
      { id: "knowledge", name: "Knowledge", phase: "knowledge", dependencies: ["validation"], parallelizable: false },
      { id: "selfEvolution", name: "SelfEvolution", phase: "selfEvolution", dependencies: ["knowledge"], parallelizable: false },
    ];

    const edges = nodes.flatMap((node) => node.dependencies.map((dependency) => ({ from: dependency, to: node.id })));
    return { nodes, edges };
  }
}
