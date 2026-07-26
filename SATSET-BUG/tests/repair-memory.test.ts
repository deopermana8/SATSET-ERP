import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { RepairMemoryEngine } from "../src/doctor/RepairMemoryEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-repair-memory-"));
  const context = new Context({
    projectRoot: root,
    projectName: "repair-memory",
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
        severity: "high",
        errors: ["TS2339: Property foo does not exist on type bar"],
      },
    },
  });

  await new RepairMemoryEngine().run(context);
  const first = (context.metadata as Record<string, unknown>).repairMemory as { reused: boolean; entries: Array<{ id: string; category: string }> };
  assert.equal(first.reused, false);
  assert.equal(first.entries.length, 1);

  const followUp = new Context({
    projectRoot: root,
    projectName: "repair-memory",
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
        severity: "high",
        errors: ["TS2339: Property foo does not exist on type bar"],
      },
    },
  });

  await new RepairMemoryEngine().run(followUp);
  const second = (followUp.metadata as Record<string, unknown>).repairMemory as { reused: boolean; entries: Array<{ id: string; category: string }> };
  assert.equal(second.reused, true);
  assert.ok(second.entries.length >= 1);
  console.log("repair memory test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
