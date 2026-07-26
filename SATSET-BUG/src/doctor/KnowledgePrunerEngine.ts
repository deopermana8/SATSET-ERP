import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";

export interface KnowledgePruningResult {
  nodes: Array<{ id: string; label: string }>;
  archived: string[];
}

export class KnowledgePrunerEngine implements IEngine {
  public readonly name = "KnowledgePrunerEngine";

  async run(context: Context): Promise<void> {
    const graph = (context.metadata as Record<string, unknown>).knowledgeGraph as { nodes?: Array<{ id: string; label?: string }>; edges?: Array<unknown> } | undefined;
    const nodes = (graph?.nodes ?? []).map((node) => ({ id: node.id, label: node.label ?? node.id }));

    const merged = new Map<string, { id: string; label: string }>();
    for (const node of nodes) {
      const normalized = node.label.toLowerCase();
      const existing = Array.from(merged.values()).find((candidate) => candidate.label.toLowerCase() === normalized);
      if (existing) {
        continue;
      }
      merged.set(node.id, node);
    }

    const deduped = Array.from(merged.values());
    const archived = nodes.filter((node) => !deduped.some((candidate) => candidate.id === node.id)).map((node) => node.id);

    const pruned = { nodes: deduped, archived };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "knowledge-pruning",
      name: "knowledge-pruning",
      templatePath: path.join(context.projectRoot, "templates", "repair-plan.md.tpl"),
      outputPath: path.join(context.projectRoot, "knowledge", "knowledge-pruning.json"),
      variables: {
        strategy: "prune",
        priority: "low",
        category: "knowledge",
      },
    }]);

    context.metadata = {
      ...context.metadata,
      knowledgePruning: pruned,
    } as typeof context.metadata & { knowledgePruning?: KnowledgePruningResult };
  }
}
