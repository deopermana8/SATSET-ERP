import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { RuntimeScheduler } from "../src/doctor/RuntimeScheduler.js";
import { EventBus } from "../src/doctor/EventBus.js";
import { CheckpointManager } from "../src/doctor/CheckpointManager.js";

class DummyEngine {
  public readonly name: string;
  constructor(name: string) { this.name = name; }
  async run(): Promise<void> {}
}

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-runtime-scheduler-"));
  const context = new Context({
    projectRoot: root,
    projectName: "scheduler-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  const eventBus = new EventBus();
  const checkpointManager = new CheckpointManager(root);
  const scheduler = new RuntimeScheduler(context, eventBus, checkpointManager);
  scheduler.register(new DummyEngine("Requirement") as any, []);
  scheduler.register(new DummyEngine("Architecture") as any, ["Requirement"]);
  await scheduler.run();

  const states = scheduler.getStates();
  assert.equal(states.find((state) => state.name === "Requirement")?.completed, true);
  assert.equal(states.find((state) => state.name === "Architecture")?.completed, true);
  assert.ok(scheduler.getEventStream().length > 0);
  console.log("runtime scheduler test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
