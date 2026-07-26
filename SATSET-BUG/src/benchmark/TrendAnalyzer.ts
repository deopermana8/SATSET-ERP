import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";

export interface TrendReport {
  trends: {
    compileSuccessTrend: Array<{ value: number; timestamp: string }>;
    repairTrend: Array<{ value: number; timestamp: string }>;
    knowledgeReuseTrend: Array<{ value: number; timestamp: string }>;
    runtimeTrend: Array<{ value: number; timestamp: string }>;
    qualityTrend: Array<{ value: number; timestamp: string }>;
  };
  summary: string;
}

export class TrendAnalyzer {
  async run(context: Context): Promise<TrendReport> {
    const metadata = context.metadata as Record<string, unknown>;
    const compileSuccess = typeof metadata.compileEvaluation === "object" && metadata.compileEvaluation && "compileSuccess" in metadata.compileEvaluation
      ? Number((metadata.compileEvaluation as { compileSuccess?: number }).compileSuccess ?? 0)
      : 0;
    const repairAttempts = typeof metadata.compileEvaluation === "object" && metadata.compileEvaluation && "repairAttempts" in metadata.compileEvaluation
      ? Number((metadata.compileEvaluation as { repairAttempts?: number }).repairAttempts ?? 0)
      : 0;
    const reuseRate = typeof metadata.knowledgeMetrics === "object" && metadata.knowledgeMetrics && "reuseRate" in metadata.knowledgeMetrics
      ? Number((metadata.knowledgeMetrics as { reuseRate?: number }).reuseRate ?? 0)
      : 0;
    const qualityScore = typeof metadata.qualityScore === "object" && metadata.qualityScore && "overallScore" in metadata.qualityScore
      ? Number((metadata.qualityScore as { overallScore?: number }).overallScore ?? 0)
      : 0;
    const runtime = typeof metadata.buildLoop === "object" && metadata.buildLoop && "report" in metadata.buildLoop
      ? Number((metadata.buildLoop as { report?: { summary?: { durationMs?: number } } }).report?.summary?.durationMs ?? 0)
      : 0;

    const now = new Date().toISOString();
    const trends = {
      compileSuccessTrend: [{ value: compileSuccess, timestamp: now }],
      repairTrend: [{ value: repairAttempts, timestamp: now }],
      knowledgeReuseTrend: [{ value: reuseRate, timestamp: now }],
      runtimeTrend: [{ value: runtime, timestamp: now }],
      qualityTrend: [{ value: qualityScore, timestamp: now }],
    };

    const summary = `compile ${compileSuccess}, repair ${repairAttempts}, reuse ${reuseRate}, quality ${qualityScore}`;
    const reportPath = path.join(context.projectRoot, "knowledge", "trend-report.json");
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify({ trends, summary }, null, 2), "utf8");

    const report = { trends, summary };

    context.metadata = {
      ...context.metadata,
      trendReport: report,
    } as typeof context.metadata & { trendReport?: TrendReport };

    return report;
  }
}
