import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { EventBus } from "../src/doctor/EventBus.js";
import { DashboardRuntime } from "../src/doctor/DashboardRuntime.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "dashboard-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root: process.cwd() },
  });

  const bus = new EventBus();
  const dashboard = new DashboardRuntime(context, bus);
  bus.emit({ type: "EngineStarted", timestamp: new Date().toISOString(), engine: "Requirement" });
  bus.emit({ type: "EngineFinished", timestamp: new Date().toISOString(), engine: "Requirement" });
  const snapshot = dashboard.getSnapshot();
  assert.ok(snapshot.completedEngines.includes("Requirement"));
  console.log("runtime dashboard test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
