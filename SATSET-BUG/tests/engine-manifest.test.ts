import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import type { IEngine } from "../src/core/IEngine.js";
import type { EngineManifest } from "../src/runtime/EngineManifest.js";

class StubEngine implements IEngine {
  public readonly name = "StubEngine";

  getManifest(): EngineManifest {
    return {
      id: "stub-engine",
      name: this.name,
      version: "1.0.0",
      author: "satset",
      category: "test",
      priority: 10,
      enabled: true,
      timeout: 1000,
      retryPolicy: { retries: 1, backoff: 10 },
      dependencies: [],
      tags: ["test"],
    };
  }

  async run(_context: Context): Promise<void> {}
}

async function main(): Promise<void> {
  const engine = new StubEngine();
  const manifest = engine.getManifest();
  assert.equal(manifest.id, "stub-engine");
  assert.equal(manifest.category, "test");
  console.log("engine manifest test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
