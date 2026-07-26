import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { GoalManager } from "../src/agent/GoalManager.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-goal-manager-"));
  const manager = new GoalManager(root);

  const goal = await manager.createGoal("Implement an autonomous repair loop");
  assert.equal(goal.status, "planned");

  const updated = await manager.updateGoal(goal.id, { status: "running" });
  assert.equal(updated.status, "running");

  const persisted = await fs.readFile(path.join(root, "knowledge", "goals.json"), "utf8");
  assert.ok(JSON.parse(persisted).goals.length >= 1);

  console.log("goal manager test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
