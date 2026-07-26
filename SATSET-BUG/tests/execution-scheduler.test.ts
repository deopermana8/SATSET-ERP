import assert from "node:assert/strict";
import { ExecutionScheduler } from "../src/runtime/ExecutionScheduler.js";
import { Context } from "../src/core/Context.js";

class DemoEngine {
  public readonly name: string;
  constructor(name: string) { this.name = name; }
  getManifest() { return { id: this.name.toLowerCase(), name: this.name, version: "1.0.0", author: "satset", category: "test", priority: 1, enabled: true, timeout: 1000, retryPolicy: { retries: 0, backoff: 0 }, dependencies: [], tags: [] }; }
  async run(_context: Context): Promise<void> {}
}

async function main(): Promise<void> {
  const scheduler = new ExecutionScheduler();
  const first = new DemoEngine("First");
  const second = new DemoEngine("Second");
  const groups = await scheduler.createGroups([first, second]);
  assert.ok(groups.length >= 1);
  console.log("execution scheduler test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
