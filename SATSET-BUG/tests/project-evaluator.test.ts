import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { ProjectEvaluator } from "../src/benchmark/ProjectEvaluator.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "project-evaluator",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root: process.cwd(),
      benchmarkResult: [{ score: 80 }, { score: 90 }],
    },
  });

  await new ProjectEvaluator().run(context);
  const evaluation = (context.metadata as Record<string, unknown>).projectEvaluation as Record<string, number>;

  assert.ok(evaluation.blueprintCompleteness >= 80);
  assert.ok(evaluation.documentationCompleteness >= 80);
  console.log("project evaluator test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
