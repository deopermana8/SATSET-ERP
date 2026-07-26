import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { TrendAnalyzer } from "../src/benchmark/TrendAnalyzer.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "trend-analyzer",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root: process.cwd(),
      benchmarkResult: [{ project: "POS", score: 75 }],
      qualityScore: { overallScore: 74 },
      compileEvaluation: { compileSuccess: 80 },
      knowledgeMetrics: { reuseRate: 0.2 },
    },
  });

  const analysis = await new TrendAnalyzer().run(context);
  assert.ok(analysis.trends.compileSuccessTrend.length >= 1);
  assert.ok(analysis.trends.qualityTrend.length >= 1);
  console.log("trend analyzer test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
