import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { ReasoningEngine } from "../src/reasoning/ReasoningEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-usecases-"));
  const context = new Context({
    projectRoot: root,
    projectName: "attendance-app",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "I want an attendance application." },
  });

  await new ReasoningEngine().run(context);
  const reasoning = (context.metadata as { reasoning?: { useCases?: string[] } }).reasoning;
  assert.ok(reasoning?.useCases?.length);
  console.log("use case generation test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
