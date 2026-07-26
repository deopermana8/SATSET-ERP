import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { FactoryRuntime } from "../src/doctor/FactoryRuntime.js";
import { AIRequirementEngine } from "../src/ai/engines/AIRequirementEngine.js";
import { ArchitectureBuilder } from "../src/ai/engines/ArchitectureBuilder.js";
import { ProjectScaffolder } from "../src/ai/engines/ProjectScaffolder.js";
import { CertificationEngine } from "../src/ai/engines/CertificationEngine.js";
import { DashboardEngine } from "../src/ai/engines/DashboardEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-runtime-pipeline-"));
  const context = new Context({
    projectRoot: root,
    projectName: "runtime-pipeline",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "build autonomous runtime" },
  });

  const runtime = new FactoryRuntime(context, {
    engines: [new AIRequirementEngine(), new ArchitectureBuilder(), new ProjectScaffolder(), new CertificationEngine(), new DashboardEngine()],
  });

  await runtime.run();

  const dashboardPath = path.join(root, "dashboard.json");
  assert.equal(await fs.access(dashboardPath).then(() => true).catch(() => false), true, "dashboard artifact should be written");
  assert.ok((context.metadata as { historyEvents?: unknown[] }).historyEvents?.length, "history should record events");
  console.log("runtime pipeline test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
