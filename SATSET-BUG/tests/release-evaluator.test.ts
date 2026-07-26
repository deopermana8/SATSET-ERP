import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { ReleaseEvaluator } from "../src/benchmark/ReleaseEvaluator.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "release-evaluator",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root: process.cwd(),
      qualityScore: { overallScore: 88 },
      compileEvaluation: { compileSuccess: 100 },
      knowledgeMetrics: { reuseRate: 0.5 },
    },
  });

  const evaluation = await new ReleaseEvaluator().run(context);
  assert.equal(evaluation.status, "READY");
  assert.ok(evaluation.summary.includes("ready"));
  console.log("release evaluator test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
