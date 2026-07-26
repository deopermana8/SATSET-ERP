import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { ProjectReasonerEngine } from "../src/ai/engines/ReasoningBrainEngines.js";
import { IntentAnalyzerEngine } from "../src/ai/engines/ReasoningBrainEngines.js";
import { DomainAnalyzerEngine } from "../src/ai/engines/ReasoningBrainEngines.js";
import { FeaturePlannerEngine } from "../src/ai/engines/ReasoningBrainEngines.js";
import { ConstraintAnalyzerEngine } from "../src/ai/engines/ReasoningBrainEngines.js";
import { ArchitectureReasonerEngine } from "../src/ai/engines/ReasoningBrainEngines.js";
import { TaskBreakdownEngine } from "../src/ai/engines/ReasoningBrainEngines.js";
import { PromptCompilerEngine } from "../src/ai/engines/ReasoningBrainEngines.js";
import { ReflectionEngine } from "../src/ai/engines/ReasoningBrainEngines.js";
import { CriticEngine } from "../src/ai/engines/ReasoningBrainEngines.js";
import { ConfidenceEngine } from "../src/ai/engines/ReasoningBrainEngines.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-reasoning-brain-"));
  const context = new Context({
    projectRoot: root,
    projectName: "reasoning-brain-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "POS Wisata Lontar Sewu" },
  });

  await new ProjectReasonerEngine().run(context);
  await new IntentAnalyzerEngine().run(context);
  await new DomainAnalyzerEngine().run(context);
  await new FeaturePlannerEngine().run(context);
  await new ConstraintAnalyzerEngine().run(context);
  await new ArchitectureReasonerEngine().run(context);
  await new TaskBreakdownEngine().run(context);
  await new PromptCompilerEngine().run(context);
  await new ReflectionEngine().run(context);
  await new CriticEngine().run(context);
  await new ConfidenceEngine().run(context);

  const expectedFiles = [
    path.join(root, "intent.json"),
    path.join(root, "domain.json"),
    path.join(root, "features.json"),
    path.join(root, "constraints.json"),
    path.join(root, "architecture-reasoning.md"),
    path.join(root, "tasks.json"),
    path.join(root, "compiled-prompt.md"),
    path.join(root, "reflection.md"),
    path.join(root, "confidence.json"),
  ];

  for (const file of expectedFiles) {
    assert.equal(await fs.access(file).then(() => true).catch(() => false), true, `${path.basename(file)} should be written`);
  }

  const reasoningBrain = context.metadata?.reasoningBrain as Record<string, unknown> | undefined;
  assert.ok(reasoningBrain, "reasoning brain metadata should be populated");
  console.log("reasoning brain test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
