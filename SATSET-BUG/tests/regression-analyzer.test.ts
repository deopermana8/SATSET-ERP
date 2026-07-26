import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { RegressionAnalyzer } from "../src/benchmark/RegressionAnalyzer.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-regression-"));
  const context = new Context({
    projectRoot: root,
    projectName: "regression-analyzer",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root,
      benchmarkResult: [{ project: "POS", score: 80 }],
      qualityScore: { overallScore: 81 },
    },
  });

  const previous = path.join(root, "knowledge", "benchmark-history.json");
  await fs.mkdir(path.dirname(previous), { recursive: true });
  await fs.writeFile(previous, JSON.stringify([{ project: "POS", score: 90 }]), "utf8");

  const result = await new RegressionAnalyzer().run(context);
  assert.equal(result.status, "regression");
  assert.equal(result.delta, -10);
  assert.equal(result.improvement, false);
  assert.ok(result.summary.includes("regression"));
  console.log("regression analyzer test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
