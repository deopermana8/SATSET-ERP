import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { RepairLoopEngine } from "../src/ai/engines/RepairLoopEngine.js";
import { Context } from "../src/core/Context.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "repair-loop-no-verification-"));
  const context = new Context({
    projectRoot: root,
    projectName: "repair-loop-no-verification",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  // Ensure context.verification is NOT set (this is the bug condition)
  assert.equal(context.verification, undefined, "context.verification should be undefined before RepairLoopEngine runs");

  await new RepairLoopEngine().run(context);

  // The repair loop should have completed successfully despite verification being undefined
  const repairLoop = (context.metadata as Record<string, unknown>).repairLoop as { reason?: string; attempts?: number } | undefined;
  assert.ok(repairLoop, "repair loop metadata should be populated");
  assert.equal(repairLoop?.reason, "no-issues", "repair loop should complete with 'no-issues' when no issues are present");
  assert.ok(repairLoop?.attempts && repairLoop.attempts > 0, "repair loop should have made at least one attempt");

  console.log("✓ Regression Test 1 PASSED: RepairLoopEngine stops correctly without context.verification");
  console.log(`  - Loop reason: ${repairLoop?.reason}`);
  console.log(`  - Loop attempts: ${repairLoop?.attempts}`);
}

void main().catch((error) => {
  console.error("✗ Regression Test 1 FAILED:", error.message);
  process.exitCode = 1;
});
