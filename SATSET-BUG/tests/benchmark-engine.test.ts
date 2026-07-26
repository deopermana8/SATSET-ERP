import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { BenchmarkEngine } from "../src/benchmark/BenchmarkEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-benchmark-engine-"));
  const benchmarkRoot = path.join(root, "benchmarks", "POS");
  await fs.mkdir(benchmarkRoot, { recursive: true });
  await fs.writeFile(path.join(benchmarkRoot, "idea.md"), "Point of sale system.", "utf8");
  await fs.writeFile(path.join(benchmarkRoot, "expected-artifacts.json"), JSON.stringify(["src/app.ts"]), "utf8");
  await fs.writeFile(path.join(benchmarkRoot, "expected-api.json"), JSON.stringify([]), "utf8");
  await fs.writeFile(path.join(benchmarkRoot, "expected-database.json"), JSON.stringify([]), "utf8");
  await fs.writeFile(path.join(benchmarkRoot, "expected-ui.json"), JSON.stringify([]), "utf8");
  await fs.writeFile(path.join(benchmarkRoot, "expected-tests.json"), JSON.stringify([]), "utf8");

  const context = new Context({
    projectRoot: root,
    projectName: "benchmark-engine",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  await new BenchmarkEngine().run(context);

  const benchmarkResult = (context.metadata as Record<string, unknown>).benchmarkResult as Array<{ project: string }> | undefined;
  const resultFile = path.join(root, "knowledge", "benchmark-result.json");
  const saved = await fs.readFile(resultFile, "utf8");

  assert.ok(Array.isArray(benchmarkResult));
  assert.ok(benchmarkResult?.length >= 1);
  assert.match(saved, /POS/);
  console.log("benchmark engine test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
