import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { RuntimeMonitor } from "../src/runtime/RuntimeMonitor.js";

async function main(): Promise<void> {
  const context = new Context({ projectRoot: process.cwd(), projectName: "runtime-monitor", nodeVersion: process.version, pnpmVersion: "9.0.0", typescriptVersion: "5.8.3", prismaVersion: "5.0.0", nextVersion: "14.0.0", issues: [], recommendations: [], metadata: { root: process.cwd(), idea: "monitor" } });
  const metrics = new RuntimeMonitor().collect(context, { benchmarkScore: 65, qualityScore: 72, healthScore: 78 });
  assert.ok(metrics.memoryUsedMb >= 0);
  assert.equal(metrics.benchmarkScore, 65);
  console.log("runtime monitor test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
