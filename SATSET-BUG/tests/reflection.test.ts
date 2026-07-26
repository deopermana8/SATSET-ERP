import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { ReflectionEngine } from "../src/ai/engines/ReasoningBrainEngines.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-reflection-"));
  const context = new Context({
    projectRoot: root,
    projectName: "reflection-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "ecommerce" },
  });

  await new ReflectionEngine().run(context);
  const reflectionPath = path.join(root, "reflection.md");
  assert.equal(await fs.access(reflectionPath).then(() => true).catch(() => false), true, "reflection artifact should be written");
  console.log("reflection test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
