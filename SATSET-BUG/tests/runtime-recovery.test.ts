import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { CheckpointManager } from "../src/doctor/CheckpointManager.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-runtime-recovery-"));
  const context = new Context({
    projectRoot: root,
    projectName: "recovery-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  const checkpointManager = new CheckpointManager(root);
  await checkpointManager.save(context, [{ type: "ProjectCreated", timestamp: new Date().toISOString() }], "bootstrap");
  const restored = await checkpointManager.restore(context);

  assert.ok(restored, "checkpoint should be restored");
  assert.equal(restored?.projectName, "recovery-demo");
  console.log("runtime recovery test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
