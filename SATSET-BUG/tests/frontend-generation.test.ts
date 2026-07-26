import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { FrontendGenerator } from "../src/ai/engines/FrontendGenerator.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-frontend-"));
  const context = new Context({
    projectRoot: root,
    projectName: "frontend-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "frontend" },
  });

  await new FrontendGenerator().run(context);
  const output = path.join(root, "src", "ui", "HomePage.tsx");
  assert.equal(await fs.access(output).then(() => true).catch(() => false), true, "frontend artifact should be written");
  console.log("frontend generation test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
