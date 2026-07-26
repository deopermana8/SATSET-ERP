import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { BackendGenerator } from "../src/ai/engines/BackendGenerator.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-backend-"));
  const context = new Context({
    projectRoot: root,
    projectName: "backend-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "backend" },
  });

  await new BackendGenerator().run(context);
  const output = path.join(root, "src", "api", "health", "health.controller.ts");
  assert.equal(await fs.access(output).then(() => true).catch(() => false), true, "backend artifact should be written");
  console.log("backend generation test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
