import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { TaskGraphEngine } from "../src/orchestrator/TaskGraphEngine.js";
import { SchedulerEngine } from "../src/orchestrator/SchedulerEngine.js";
import { WorkerEngine } from "../src/orchestrator/WorkerEngine.js";
import { ProgressEngine } from "../src/orchestrator/ProgressEngine.js";
import { DecisionEngine } from "../src/orchestrator/DecisionEngine.js";
import { ResumeEngine } from "../src/orchestrator/ResumeEngine.js";
import { CheckpointEngine } from "../src/orchestrator/CheckpointEngine.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "satset-orchestrator",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root: process.cwd() },
  });

  await new TaskGraphEngine().run(context);
  await new SchedulerEngine().run(context);
  await new WorkerEngine().run(context);
  await new ProgressEngine().run(context);
  await new DecisionEngine().run(context);
  await new ResumeEngine().run(context);
  await new CheckpointEngine().run(context);

  assert.ok(context.metadata?.taskGraph?.tasks?.length, "task graph should be created");
  assert.ok(context.metadata?.scheduler?.scheduled?.length, "scheduler should schedule tasks");
  assert.ok(context.metadata?.worker?.executed?.length, "worker should execute tasks");
  assert.ok(context.metadata?.checkpoint?.created, "checkpoint should be created");

  console.log("scheduler test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
