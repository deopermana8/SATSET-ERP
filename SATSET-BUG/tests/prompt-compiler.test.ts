import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { PromptCompilerEngine } from "../src/ai/engines/ReasoningBrainEngines.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-prompt-compiler-"));
  const context = new Context({
    projectRoot: root,
    projectName: "prompt-compiler-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "booking" },
  });

  await new PromptCompilerEngine().run(context);
  const promptPath = path.join(root, "compiled-prompt.md");
  assert.equal(await fs.access(promptPath).then(() => true).catch(() => false), true, "prompt compiler artifact should be written");
  console.log("prompt compiler test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
