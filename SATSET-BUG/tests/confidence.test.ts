import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { ConfidenceEngine } from "../src/ai/engines/ReasoningBrainEngines.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-confidence-"));
  const context = new Context({
    projectRoot: root,
    projectName: "confidence-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "inventory" },
  });

  await new ConfidenceEngine().run(context);
  const confidencePath = path.join(root, "confidence.json");
  assert.equal(await fs.access(confidencePath).then(() => true).catch(() => false), true, "confidence artifact should be written");
  console.log("confidence test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
