import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { AgentMemory } from "../src/agent/AgentMemory.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-agent-memory-"));
  const memory = new AgentMemory(root);

  await memory.record({ goalId: "g1", taskId: "t1", action: "started", summary: "planning started" });
  const entries = memory.recall("g1");
  assert.equal(entries.length, 1);

  const persisted = await fs.readFile(path.join(root, "knowledge", "agent-history.json"), "utf8");
  assert.ok(JSON.parse(persisted).entries.length >= 1);

  console.log("agent memory test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
