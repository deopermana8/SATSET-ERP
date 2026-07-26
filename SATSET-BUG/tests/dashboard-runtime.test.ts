import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { DashboardRuntime } from "../src/runtime/DashboardRuntime.js";
import { RuntimeMonitor } from "../src/runtime/RuntimeMonitor.js";
import { ExecutionGraph } from "../src/runtime/ExecutionGraph.js";

async function main(): Promise<void> {
  const context = new Context({ projectRoot: process.cwd(), projectName: "dashboard-test", nodeVersion: process.version, pnpmVersion: "9.0.0", typescriptVersion: "5.8.3", prismaVersion: "5.0.0", nextVersion: "14.0.0", issues: [], recommendations: [], metadata: { root: process.cwd(), idea: "dashboard" } });
  const metrics = new RuntimeMonitor().collect(context, { benchmarkScore: 85, qualityScore: 88, healthScore: 90 });
  const graph = new ExecutionGraph().createGraph([]);
  const dashboard = new DashboardRuntime().getSnapshot(context, metrics, graph);
  assert.equal(dashboard.runtimeStatus, "running");
  assert.equal(dashboard.currentPhase, "validation");
  console.log("dashboard runtime test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
