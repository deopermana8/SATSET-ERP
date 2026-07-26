import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { Context } from "../src/core/Context.js";
import { RepairDecisionEngine } from "../src/doctor/RepairDecisionEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-repair-decision-"));
  const context = new Context({
    projectRoot: root,
    projectName: "repair-decision",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root,
      failureReport: {
        category: "typescript",
        errors: ["TS2339: Property foo does not exist on type bar", "TS2322: Type string is not assignable to type number"],
      },
    },
  });

  await new RepairDecisionEngine().run(context);
  const decision = (context.metadata as Record<string, unknown>).repairDecision as {
    strategy: string;
    priority: string;
    changes: Array<{ filePath: string }>;
  };

  assert.equal(decision.strategy, "patch-file");
  assert.equal(decision.priority, "high");
  assert.ok(decision.changes.length > 0);
  console.log("repair decision test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
