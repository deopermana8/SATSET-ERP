import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";

export interface RegressionAnalysis {
  status: "regression" | "improvement" | "stable";
  currentScore: number;
  previousScore: number;
  delta: number;
  improvement: boolean;
  summary: string;
}

export class RegressionAnalyzer {
  async run(context: Context): Promise<RegressionAnalysis> {
    const metadata = context.metadata as Record<string, unknown>;
    const result = Array.isArray(metadata.benchmarkResult) ? (metadata.benchmarkResult as Array<{ score?: number }>)[0] : undefined;
    const currentScore = result?.score ?? (typeof metadata.qualityScore === "object" && metadata.qualityScore && "overallScore" in metadata.qualityScore ? Number((metadata.qualityScore as { overallScore?: number }).overallScore ?? 0) : 0);

    const historyFile = path.join(context.projectRoot, "knowledge", "benchmark-history.json");
    let previousScore = 0;
    try {
      const historyRaw = await fs.readFile(historyFile, "utf8");
      const history = JSON.parse(historyRaw) as Array<{ score?: number }>;
      previousScore = history[history.length - 1]?.score ?? 0;
    } catch {
      previousScore = currentScore;
    }

    const delta = currentScore - previousScore;
    const improvement = delta > 0;
    const status = delta < 0 ? "regression" : delta > 0 ? "improvement" : "stable";
    const summary = `${status}: ${currentScore} vs ${previousScore} (delta ${delta >= 0 ? "+" : ""}${delta})`;

    const analysis: RegressionAnalysis = {
      status,
      currentScore,
      previousScore,
      delta,
      improvement,
      summary,
    };

    await fs.mkdir(path.dirname(historyFile), { recursive: true });
    const existingHistory = await fs.readFile(historyFile, "utf8").catch(() => "[]");
    const parsedHistory = JSON.parse(existingHistory) as Array<{ score?: number; timestamp?: string }>;
    const nextHistory = [...parsedHistory, { score: currentScore, timestamp: new Date().toISOString() }];
    await fs.writeFile(historyFile, JSON.stringify(nextHistory, null, 2), "utf8");

    context.metadata = {
      ...context.metadata,
      regressionAnalysis: analysis,
    } as typeof context.metadata & { regressionAnalysis?: RegressionAnalysis };

    return analysis;
  }
}
