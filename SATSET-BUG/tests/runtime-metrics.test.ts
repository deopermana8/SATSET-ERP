import assert from "node:assert/strict";
import { RuntimeMetricsEngine } from "../src/runtime/RuntimeMetricsEngine.js";
import { Context } from "../src/core/Context.js";

async function main(): Promise<void> {
  const context = new Context({ projectRoot: process.cwd(), projectName: "metrics-test", nodeVersion: process.version, pnpmVersion: "9.0.0", typescriptVersion: "5.8.3", prismaVersion: "5.0.0", nextVersion: "14.0.0", issues: [], recommendations: [], metadata: { root: process.cwd(), idea: "metrics" } });
  const metrics = new RuntimeMetricsEngine();
  const report = await metrics.collect(context, { executionTimeMs: 10, memoryUsageMb: 1, cpuUsagePercent: 5, warnings: 0, errors: 0, retries: 0, knowledgeReuse: 1, confidence: 0.9 });
  assert.ok(report.executionTimeMs >= 0);
  console.log("runtime metrics test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
