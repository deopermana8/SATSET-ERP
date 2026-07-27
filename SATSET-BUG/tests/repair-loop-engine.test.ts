import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { RepairLoopEngine } from "../src/ai/engines/RepairLoopEngine.js";
import { Context } from "../src/core/Context.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "repair-loop-engine-"));
  const context = new Context({
    projectRoot: root,
    projectName: "repair-loop-engine",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  await new RepairLoopEngine().run(context);

  const repairLoop = (context.metadata as Record<string, unknown>).repairLoop as { reason?: string } | undefined;
  assert.equal(repairLoop?.reason, "no-issues", "repair loop metadata should reflect the actual lifecycle reason when no repair is needed");

  console.log("repair loop engine test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
