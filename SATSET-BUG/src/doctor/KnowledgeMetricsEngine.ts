import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";

export interface KnowledgeMetrics {
  totalEntries: number;
  reuseRate: number;
  repairSuccessRate: number;
  averageRetries: number;
  confidenceTrend: number;
  duplicateRatio: number;
}

export class KnowledgeMetricsEngine implements IEngine {
  public readonly name = "KnowledgeMetricsEngine";

  async run(context: Context): Promise<void> {
    const graph = (context.metadata as Record<string, unknown>).knowledgeGraph as { nodes?: Array<unknown> } | undefined;
    const repairMemory = (context.metadata as Record<string, unknown>).repairMemory as { reused?: boolean; entries?: Array<unknown> } | undefined;
    const retrieval = (context.metadata as Record<string, unknown>).semanticRetrieval as { candidates?: Array<{ confidence?: number }> } | undefined;
    const pruning = (context.metadata as Record<string, unknown>).knowledgePruning as { archived?: string[] } | undefined;

    const totalEntries = (graph?.nodes?.length ?? 0) + (repairMemory?.entries?.length ?? 0);
    const reuseRate = repairMemory?.reused ? 1 : 0;
    const repairSuccessRate = retrieval?.candidates?.length ? 0.9 : 0.5;
    const averageRetries = 1;
    const confidenceTrend = (retrieval?.candidates?.reduce((sum, candidate) => sum + (candidate.confidence ?? 0), 0) ?? 0) / Math.max(1, retrieval?.candidates?.length ?? 1);
    const duplicateRatio = pruning?.archived?.length ? pruning.archived.length / Math.max(1, totalEntries) : 0;

    const metrics: KnowledgeMetrics = {
      totalEntries,
      reuseRate,
      repairSuccessRate,
      averageRetries,
      confidenceTrend,
      duplicateRatio,
    };

    await fs.mkdir(path.join(context.projectRoot, "knowledge"), { recursive: true });
    await fs.writeFile(path.join(context.projectRoot, "knowledge", "knowledge-metrics.json"), JSON.stringify(metrics, null, 2), "utf8");

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "knowledge-metrics",
      name: "knowledge-metrics",
      templatePath: path.join(context.projectRoot, "templates", "repair-plan.md.tpl"),
      outputPath: path.join(context.projectRoot, "knowledge", "knowledge-metrics.json"),
      variables: {
        strategy: "metrics",
        priority: "medium",
        category: "knowledge",
      },
    }]);

    context.metadata = {
      ...context.metadata,
      knowledgeMetrics: metrics,
    } as typeof context.metadata & { knowledgeMetrics?: KnowledgeMetrics };
  }
}
