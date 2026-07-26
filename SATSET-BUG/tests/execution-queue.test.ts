import assert from "node:assert/strict";
import { ExecutionQueue } from "../src/agent/ExecutionQueue.js";

async function main(): Promise<void> {
  const queue = new ExecutionQueue();
  queue.enqueue({ id: "t1", title: "inspect", type: "analyze", priority: 1 });
  queue.enqueue({ id: "t2", title: "repair", type: "repair", priority: 2 });

  const first = queue.dequeue();
  assert.equal(first?.id, "t1");

  const progress = queue.getProgress();
  assert.equal(progress.pending, 1);
  assert.equal(progress.total, 2);

  console.log("execution queue test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
