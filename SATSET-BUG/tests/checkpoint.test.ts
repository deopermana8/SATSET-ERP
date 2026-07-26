import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
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

  await new CheckpointEngine().run(context);
  assert.equal(context.metadata?.checkpoint?.created, true);

  console.log("checkpoint test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
