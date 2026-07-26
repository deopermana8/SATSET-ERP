import assert from "node:assert/strict";
import { EventBus } from "../src/doctor/EventBus.js";

async function main(): Promise<void> {
  const bus = new EventBus();
  let seen = 0;
  bus.subscribe((event) => {
    if (event.type === "PIPELINE_STARTED") {
      seen += 1;
    }
  });
  bus.emit({ type: "PIPELINE_STARTED", timestamp: new Date().toISOString(), stage: "doctor" });
  assert.equal(seen, 1);
  console.log("eventbus v2 test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
