import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { AgentPlanner } from "../src/agent/AgentPlanner.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-agent-planner-"));
  const context = new Context({
    projectRoot: root,
    projectName: "agent-planner",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  const planner = new AgentPlanner(root);
  const plan = await planner.planGoal("Deliver a stable repair workflow", context);

  assert.equal(plan.goal, "Deliver a stable repair workflow");
  assert.ok(plan.tasks.length > 0);
  assert.equal(plan.tasks[0].status, "pending");

  const persisted = await fs.readFile(path.join(root, "knowledge", "task-tree.json"), "utf8");
  assert.ok(JSON.parse(persisted).tasks.length > 0);

  console.log("agent planner test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
