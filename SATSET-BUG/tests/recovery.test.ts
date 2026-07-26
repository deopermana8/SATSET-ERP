import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { RecoveryManager } from "../src/runtime/RecoveryManager.js";

async function main(): Promise<void> {
  const context = new Context({ projectRoot: process.cwd(), projectName: "recovery-test", nodeVersion: process.version, pnpmVersion: "9.0.0", typescriptVersion: "5.8.3", prismaVersion: "5.0.0", nextVersion: "14.0.0", issues: [], recommendations: [], metadata: { root: process.cwd(), idea: "recovery" } });
  const recovery = new RecoveryManager();
  await recovery.save(context, ["compile", "repair"]);
  const pending = await recovery.resume(context, ["compile", "repair", "benchmark"]);
  assert.equal(pending.length, 1);
  console.log("recovery test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
