import assert from "node:assert/strict";
import { EngineRegistry } from "../src/runtime/EngineRegistry.js";

async function main(): Promise<void> {
  const registry = new EngineRegistry();
  registry.register({ name: "Doctor", run: async () => {} } as any);
  assert.ok(registry.get("Doctor"));
  assert.ok(registry.list().length >= 1);
  console.log("engine registry test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
