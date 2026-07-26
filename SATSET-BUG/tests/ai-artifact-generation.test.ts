import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { PlannerEngine } from "../src/ai/engines/PlannerEngine.js";
import { ArchitectureEngine } from "../src/ai/engines/ArchitectureEngine.js";
import { DatabaseGenerator } from "../src/ai/engines/DatabaseGenerator.js";
import { BackendGenerator } from "../src/ai/engines/BackendGenerator.js";
import { FrontendGenerator } from "../src/ai/engines/FrontendGenerator.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-artifact-"));
  const context = new Context({
    projectRoot: root,
    projectName: "artifact-fixture",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, packageJson: { name: "artifact-fixture" } },
  });

  await new PlannerEngine().run(context);
  await new ArchitectureEngine().run(context);
  await new DatabaseGenerator().run(context);
  await new BackendGenerator().run(context);
  await new FrontendGenerator().run(context);

  const planningPath = path.join(root, "docs", "planning.md");
  const architecturePath = path.join(root, "docs", "architecture.md");
  const schemaPath = path.join(root, "prisma", "schema.prisma");
  const backendPath = path.join(root, "src", "api", "health", "health.controller.ts");
  const frontendPath = path.join(root, "src", "ui", "HomePage.tsx");

  assert.equal(await fs.access(planningPath).then(() => true).catch(() => false), true, "planning artifact should be written");
  assert.equal(await fs.access(architecturePath).then(() => true).catch(() => false), true, "architecture artifact should be written");
  assert.equal(await fs.access(schemaPath).then(() => true).catch(() => false), true, "database artifact should be written");
  assert.equal(await fs.access(backendPath).then(() => true).catch(() => false), true, "backend artifact should be written");
  assert.equal(await fs.access(frontendPath).then(() => true).catch(() => false), true, "frontend artifact should be written");

  console.log("ai artifact generation test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
