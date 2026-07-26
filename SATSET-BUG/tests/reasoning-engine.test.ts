import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { ReasoningEngine } from "../src/reasoning/ReasoningEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-reasoning-"));
  const context = new Context({
    projectRoot: root,
    projectName: "reasoning-test",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "Attendance System" },
  });

  await new ReasoningEngine().run(context);

  const outputs = [
    path.join(root, "requirement.json"),
    path.join(root, "architecture.md"),
    path.join(root, "entities.json"),
    path.join(root, "usecases.json"),
    path.join(root, "api.json"),
    path.join(root, "database.json"),
    path.join(root, "screens.json"),
    path.join(root, "workflow.json"),
  ];

  for (const file of outputs) {
    assert.equal(await fs.access(file).then(() => true).catch(() => false), true, `${path.basename(file)} should be written`);
  }

  console.log("reasoning engine test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
