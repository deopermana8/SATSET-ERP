import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { AIRequirementEngine } from "../src/ai/engines/AIRequirementEngine.js";
import { ArchitectureBuilder } from "../src/ai/engines/ArchitectureBuilder.js";
import { ProjectScaffolder } from "../src/ai/engines/ProjectScaffolder.js";
import { CertificationEngine } from "../src/ai/engines/CertificationEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-factory-"));
  const context = new Context({
    projectRoot: root,
    projectName: "attendance-system",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "Attendance System" },
  });

  await new AIRequirementEngine().run(context);
  await new ArchitectureBuilder().run(context);
  await new ProjectScaffolder().run(context);
  await new CertificationEngine().run(context);

  const requirementPath = path.join(root, "requirements", "requirement.json");
  const architecturePath = path.join(root, "docs", "architecture.md");
  const modulesPath = path.join(root, "docs", "modules.md");
  const packagePath = path.join(root, "package.json");
  const certificatePath = path.join(root, "project-certificate.json");

  assert.equal(await fs.access(requirementPath).then(() => true).catch(() => false), true, "requirement artifact should be written");
  assert.equal(await fs.access(architecturePath).then(() => true).catch(() => false), true, "architecture artifact should be written");
  assert.equal(await fs.access(modulesPath).then(() => true).catch(() => false), true, "modules artifact should be written");
  assert.equal(await fs.access(packagePath).then(() => true).catch(() => false), true, "package artifact should be written");
  assert.equal(await fs.access(certificatePath).then(() => true).catch(() => false), true, "certificate artifact should be written");

  console.log("factory flow test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
