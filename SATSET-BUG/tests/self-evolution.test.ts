import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { SelfEvolutionEngine } from "../src/selfevolution/SelfEvolutionEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-self-evolution-"));
  const context = new Context({
    projectRoot: root,
    projectName: "self-evolution-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "self learning" },
  });

  await new SelfEvolutionEngine().run(context);

  const evolution = JSON.parse(await fs.readFile(path.join(root, "knowledge", "evolution.json"), "utf8"));
  const improvements = JSON.parse(await fs.readFile(path.join(root, "knowledge", "improvements.json"), "utf8"));
  const confidence = JSON.parse(await fs.readFile(path.join(root, "knowledge", "confidence-history.json"), "utf8"));
  const learning = JSON.parse(await fs.readFile(path.join(root, "knowledge", "self-learning.json"), "utf8"));

  assert.ok(evolution.evolution.length >= 1);
  assert.ok(improvements.improvements.length >= 1);
  assert.ok(confidence.history.length >= 1);
  assert.ok(learning.acceptedImprovements >= 1);

  console.log("self evolution test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
