import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { BuildEngine } from "../src/ai/engines/BuildEngine.js";
import { CompileEngine } from "../src/ai/engines/CompileEngine.js";
import { TestEngine } from "../src/ai/engines/TestEngine.js";
import { RepairLoopEngine } from "../src/ai/engines/RepairLoopEngine.js";
import { DashboardEngine } from "../src/ai/engines/DashboardEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-build-factory-"));
  const context = new Context({
    projectRoot: root,
    projectName: "build-factory",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  await new BuildEngine().run(context);
  await new CompileEngine().run(context);
  await new TestEngine().run(context);
  await new RepairLoopEngine().run(context);
  await new DashboardEngine().run(context);

  assert.equal(await fs.access(path.join(root, ".progress.json")).then(() => true).catch(() => false), true, "progress artifact should be written");
  assert.equal(await fs.access(path.join(root, "dashboard.json")).then(() => true).catch(() => false), true, "dashboard artifact should be written");

  console.log("build factory test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
