import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";

export interface ReleaseEvaluation {
  status: "READY" | "NOT READY" | "NEEDS REPAIR" | "BLOCKED";
  summary: string;
}

export class ReleaseEvaluator {
  async run(context: Context): Promise<ReleaseEvaluation> {
    const metadata = context.metadata as Record<string, unknown>;
    const qualityScore = typeof metadata.qualityScore === "object" && metadata.qualityScore && "overallScore" in metadata.qualityScore
      ? Number((metadata.qualityScore as { overallScore?: number }).overallScore ?? 0)
      : 0;
    const compileSuccess = typeof metadata.compileEvaluation === "object" && metadata.compileEvaluation && "compileSuccess" in metadata.compileEvaluation
      ? Number((metadata.compileEvaluation as { compileSuccess?: number }).compileSuccess ?? 0)
      : 0;
    const reuseRate = typeof metadata.knowledgeMetrics === "object" && metadata.knowledgeMetrics && "reuseRate" in metadata.knowledgeMetrics
      ? Number((metadata.knowledgeMetrics as { reuseRate?: number }).reuseRate ?? 0)
      : 0;

    let status: ReleaseEvaluation["status"] = "BLOCKED";
    if (qualityScore >= 85 && compileSuccess >= 90 && reuseRate >= 0.3) {
      status = "READY";
    } else if (qualityScore >= 70 && compileSuccess >= 70) {
      status = "NEEDS REPAIR";
    } else {
      status = "NOT READY";
    }

    const summary = `${status.toLowerCase()}: quality ${qualityScore}, compile ${compileSuccess}, reuse ${reuseRate}`;
    const evaluation = { status, summary };

    const reportPath = path.join(context.projectRoot, "knowledge", "release-report.json");
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(evaluation, null, 2), "utf8");

    context.metadata = {
      ...context.metadata,
      releaseEvaluation: evaluation,
    } as typeof context.metadata & { releaseEvaluation?: ReleaseEvaluation };

    return evaluation;
  }
}
