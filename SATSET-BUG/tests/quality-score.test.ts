import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { QualityScoreEngine } from "../src/benchmark/QualityScoreEngine.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "quality-score",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root: process.cwd(),
      projectEvaluation: {
        blueprintCompleteness: 80,
        architectureConsistency: 75,
        apiCompleteness: 70,
        uiCompleteness: 65,
        testCompleteness: 85,
        documentationCompleteness: 90,
      },
      compileEvaluation: {
        compileSuccess: 100,
        repairAttempts: 1,
      },
      knowledgeMetrics: {
        reuseRate: 0.4,
      },
    },
  });

  await new QualityScoreEngine().run(context);
  const score = (context.metadata as Record<string, unknown>).qualityScore as Record<string, number>;

  assert.ok(score.overallScore >= 70);
  assert.ok(score.knowledgeReuse >= 40);
  console.log("quality score test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
