import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { AutonomousOrchestrator } from "../src/runtime/AutonomousOrchestrator.js";
import { EngineRegistry } from "../src/runtime/EngineRegistry.js";
import { ExecutionGraph } from "../src/runtime/ExecutionGraph.js";
import { RuntimeMonitor } from "../src/runtime/RuntimeMonitor.js";
import { RecoveryManager } from "../src/runtime/RecoveryManager.js";
import { DashboardRuntime } from "../src/runtime/DashboardRuntime.js";
import { EngineMetrics } from "../src/runtime/EngineMetrics.js";

async function main(): Promise<void> {
  const context = new Context({ projectRoot: process.cwd(), projectName: "runtime-test", nodeVersion: process.version, pnpmVersion: "9.0.0", typescriptVersion: "5.8.3", prismaVersion: "5.0.0", nextVersion: "14.0.0", issues: [], recommendations: [], metadata: { root: process.cwd(), idea: "runtime" } });
  const orchestrator = new AutonomousOrchestrator();
  const state = await orchestrator.execute(context, []);
  assert.equal(state.status, "completed");
  assert.ok(state.executionGraph.nodes.length >= 1);

  const registry = new EngineRegistry();
  registry.register({ name: "TestEngine", run: async () => {} } as any);
  assert.ok(registry.get("TestEngine"));

  const graph = new ExecutionGraph().createGraph([]);
  assert.ok(graph.nodes.length >= 1);

  const metrics = new RuntimeMonitor().collect(context, { benchmarkScore: 70, qualityScore: 75, healthScore: 80 });
  assert.ok(metrics.benchmarkScore >= 70);

  const recovery = new RecoveryManager();
  await recovery.save(context, ["compile"]);
  const pending = await recovery.resume(context, ["compile", "repair"]);
  assert.equal(pending.length, 1);

  const dashboard = new DashboardRuntime().getSnapshot(context, metrics, graph);
  assert.equal(dashboard.runtimeStatus, "running");

  const engineMetrics = new EngineMetrics();
  engineMetrics.record("Doctor", 10, true, 0.9, true, false);
  assert.equal(engineMetrics.get("Doctor")?.executionCount, 1);

  console.log("orchestrator tests passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
