import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";

export interface KnowledgeNode {
  id: string;
  kind: "problem" | "repair" | "file" | "engine" | "artifact";
  label: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeEdge {
  from: string;
  to: string;
  kind: string;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export class KnowledgeGraphEngine implements IEngine {
  public readonly name = "KnowledgeGraphEngine";

  async run(context: Context): Promise<void> {
    const repairMemory = (context.metadata as Record<string, unknown>).repairMemory as { entries?: Array<{ id: string; category: string; errors: string[]; solution: string }> } | undefined;
    const entries = repairMemory?.entries ?? [];
    const agentMesh = (context.metadata as Record<string, unknown>).agentMesh as { history?: Array<{ agent: string; status: string; confidence: number }> } | undefined;

    const graph: KnowledgeGraph = {
      nodes: [],
      edges: [],
    };

    for (const entry of entries) {
      const problemId = `problem:${entry.category}`;
      const repairId = `repair:${entry.id}`;
      const fileId = `file:${entry.category}`;
      const engineId = `engine:repair`;
      const artifactId = `artifact:${entry.category}`;

      graph.nodes.push(
        { id: problemId, kind: "problem", label: entry.category },
        { id: repairId, kind: "repair", label: entry.solution },
        { id: fileId, kind: "file", label: entry.category },
        { id: engineId, kind: "engine", label: "RepairMemoryEngine" },
        { id: artifactId, kind: "artifact", label: `${entry.category}-artifact` }
      );

      graph.edges.push(
        { from: problemId, to: repairId, kind: "causes" },
        { from: repairId, to: fileId, kind: "touches" },
        { from: repairId, to: engineId, kind: "generated-by" },
        { from: repairId, to: artifactId, kind: "produces" }
      );
    }

    for (const entry of agentMesh?.history ?? []) {
      const agentId = `agent:${entry.agent}`;
      const agentNode = { id: agentId, kind: "engine" as const, label: entry.agent, metadata: { status: entry.status, confidence: entry.confidence } };
      graph.nodes.push(agentNode);
      if (entry.status === "failed") {
        const failureId = `failure:${entry.agent}`;
        graph.nodes.push({ id: failureId, kind: "problem" as const, label: `${entry.agent} failure`, metadata: { confidence: entry.confidence } });
        graph.edges.push({ from: agentId, to: failureId, kind: "failed" });
      } else {
        const performanceId = `performance:${entry.agent}`;
        graph.nodes.push({ id: performanceId, kind: "artifact" as const, label: `${entry.agent} performance`, metadata: { confidence: entry.confidence } });
        graph.edges.push({ from: agentId, to: performanceId, kind: "performed" });
      }
    }

    const dedupedNodes = this.dedup(graph.nodes);
    const dedupedEdges = this.dedup(graph.edges);

    await fs.mkdir(path.join(context.projectRoot, "knowledge"), { recursive: true });
    await fs.writeFile(path.join(context.projectRoot, "knowledge", "knowledge-graph.json"), JSON.stringify({ nodes: dedupedNodes, edges: dedupedEdges }, null, 2), "utf8");

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "knowledge-graph",
      name: "knowledge-graph",
      templatePath: path.join(context.projectRoot, "templates", "repair-plan.md.tpl"),
      outputPath: path.join(context.projectRoot, "knowledge", "knowledge-graph.json"),
      variables: {
        strategy: "graph",
        priority: "high",
        category: "knowledge",
      },
    }]);

    context.metadata = {
      ...context.metadata,
      knowledgeGraph: { nodes: dedupedNodes, edges: dedupedEdges },
    } as typeof context.metadata & { knowledgeGraph?: KnowledgeGraph };
  }

  private dedup<T extends { id?: string; from?: string; to?: string }>(values: T[]): T[] {
    const seen = new Set<string>();
    return values.filter((value) => {
      const key = value.id ?? `${value.from ?? ""}:${value.to ?? ""}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
