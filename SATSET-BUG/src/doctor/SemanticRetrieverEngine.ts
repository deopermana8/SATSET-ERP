import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";

export interface RetrievalCandidate {
  id: string;
  score: number;
  confidence: number;
  successRate: number;
}

export class SemanticRetrieverEngine implements IEngine {
  public readonly name = "SemanticRetrieverEngine";

  async run(context: Context): Promise<void> {
    const graph = (context.metadata as Record<string, unknown>).knowledgeGraph as { nodes?: Array<{ id: string; label?: string }>; edges?: Array<unknown> } | undefined;
    const nodes = graph?.nodes ?? [];
    const candidates = nodes.map((node) => ({
      id: node.id,
      score: this.score(node.label ?? node.id),
      confidence: this.score(node.label ?? node.id) * 0.8,
      successRate: 0.75,
    })).sort((left, right) => right.score - left.score);

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "knowledge-index",
      name: "knowledge-index",
      templatePath: path.join(context.projectRoot, "templates", "repair-plan.md.tpl"),
      outputPath: path.join(context.projectRoot, "knowledge", "knowledge-index.json"),
      variables: {
        strategy: "retrieve",
        priority: "medium",
        category: "knowledge",
      },
    }]);

    await fs.mkdir(path.join(context.projectRoot, "knowledge"), { recursive: true });
    await fs.writeFile(path.join(context.projectRoot, "knowledge", "knowledge-index.json"), JSON.stringify({ candidates }, null, 2), "utf8");

    context.metadata = {
      ...context.metadata,
      semanticRetrieval: { candidates },
    } as typeof context.metadata & { semanticRetrieval?: { candidates: RetrievalCandidate[] } };
  }

  private score(label: string): number {
    const normalized = label.toLowerCase();
    if (normalized.includes("typescript")) return 1;
    if (normalized.includes("repair")) return 0.8;
    return 0.5;
  }
}
