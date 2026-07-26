import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { CompileEvaluator } from "../src/benchmark/CompileEvaluator.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "compile-evaluator",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root: process.cwd(),
      repairMemory: { entries: [{ id: "repair:one" }] },
      buildLoop: { report: { compilerResult: { succeeded: true }, summary: { durationMs: 2500 } } },
      retryPolicy: { maxAttempts: 2 },
    },
  });

  await new CompileEvaluator().run(context);
  const evaluation = (context.metadata as Record<string, unknown>).compileEvaluation as Record<string, number>;

  assert.equal(evaluation.compileSuccess, 100);
  assert.equal(evaluation.repairAttempts, 1);
  assert.equal(evaluation.retryCount, 2);
  console.log("compile evaluator test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
