import assert from "node:assert/strict";
import { EventBus } from "../src/doctor/EventBus.js";

async function main(): Promise<void> {
  const bus = new EventBus();
  const events: string[] = [];
  bus.subscribe((event) => events.push(event.type));
  bus.emit({ type: "EngineStarted", timestamp: new Date().toISOString() });
  bus.emit({ type: "EngineFinished", timestamp: new Date().toISOString() });
  assert.deepEqual(events, ["EngineStarted", "EngineFinished"]);
  console.log("runtime event ordering test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
