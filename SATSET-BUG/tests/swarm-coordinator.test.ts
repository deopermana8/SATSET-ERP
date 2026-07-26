import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { SwarmCoordinatorEngine } from "../src/swarm/SwarmCoordinatorEngine.js";
import { SwarmCoordinator } from "../src/swarm/SwarmCoordinator.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-swarm-"));
  const context = new Context({
    projectRoot: root,
    projectName: "swarm-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "travel platform", backendFramework: "express", frontendFramework: "next", databaseType: "postgresql", authentication: ["jwt"], openApi: true, docker: true, kubernetes: true },
  });

  await new SwarmCoordinatorEngine().run(context);

  const swarm = JSON.parse(await fs.readFile(path.join(root, "knowledge", "swarm.json"), "utf8"));
  const history = JSON.parse(await fs.readFile(path.join(root, "knowledge", "swarm-history.json"), "utf8"));
  const metrics = JSON.parse(await fs.readFile(path.join(root, "knowledge", "swarm-metrics.json"), "utf8"));

  assert.ok(swarm.agents.length >= 10);
  assert.ok(swarm.tasks.length >= 10);
  assert.ok(history.events.length >= 10);
  assert.ok(metrics.completed >= 10);

  const coordinator = new SwarmCoordinator();
  const resolved = coordinator.resolveConflicts([
    { id: "a", title: "alpha", description: "", priority: 1, agent: "BackendAgent", status: "queued" },
    { id: "b", title: "beta", description: "", priority: 2, agent: "BackendAgent", status: "queued" },
  ]);
  assert.equal(resolved[0].id, "b");

  console.log("swarm coordinator test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
