import assert from "node:assert/strict";
import { EngineRegistry } from "../src/runtime/EngineRegistry.js";
import { Context } from "../src/core/Context.js";

class DemoEngine {
  public readonly name: string;
  constructor(name: string) { this.name = name; }
  getManifest() { return { id: this.name.toLowerCase(), name: this.name, version: "1.0.0", author: "satset", category: "test", priority: 1, enabled: true, timeout: 1000, retryPolicy: { retries: 0, backoff: 0 }, dependencies: [], tags: [] }; }
  async run(_context: Context): Promise<void> {}
}

async function main(): Promise<void> {
  const registry = new EngineRegistry();
  const engine = new DemoEngine("Demo");
  registry.register(engine);
  const discovered = registry.discover();
  assert.ok(discovered.some((item) => item.name === "Demo"));
  console.log("engine registry v2 test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
