import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ExecutionHistory } from "../src/agent/ExecutionHistory.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-execution-history-"));
  const history = new ExecutionHistory(root);

  history.push({ id: "e1", goalId: "g1", taskId: "t1", status: "completed", summary: "done" });
  const snapshot = history.snapshot();
  assert.equal(snapshot.entries.length, 1);

  const persisted = await fs.readFile(path.join(root, "knowledge", "execution-history.json"), "utf8");
  assert.ok(JSON.parse(persisted).entries.length >= 1);

  console.log("execution history test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
