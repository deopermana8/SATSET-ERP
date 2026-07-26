import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { DoctorOrchestrator } from "../src/doctor/DoctorOrchestrator.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-doctor-orchestrator-"));
  const context = new Context({
    projectRoot: root,
    projectName: "doctor-orchestrator",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  await new DoctorOrchestrator().run(context);

  const progressPath = path.join(root, ".progress.json");
  const checkpointPath = path.join(root, ".checkpoints");
  const certificatePath = path.join(root, "project-certificate.json");
  const manifestPath = path.join(root, "artifacts", "manifest.json");
  const releasePath = path.join(root, "release.json");
  const deploymentPath = path.join(root, "docs", "deployment.md");
  const qualityReportPath = path.join(root, "docs", "quality-report.md");
  const metricsPath = path.join(root, "docs", "metrics.md");
  const auditPath = path.join(root, "docs", "audit.md");
  const learningPath = path.join(root, "docs", "learning.md");
  const optimizationPath = path.join(root, "docs", "optimization.md");
  const summaryPath = path.join(root, "reports", "summary.json");
  const qualityJsonPath = path.join(root, "reports", "quality.json");

  assert.equal(await fs.access(progressPath).then(() => true).catch(() => false), true, "progress artifact should be written");
  assert.equal(await fs.access(checkpointPath).then(() => true).catch(() => false), true, "checkpoint directory should be created");
  assert.equal(await fs.access(certificatePath).then(() => true).catch(() => false), true, "certificate artifact should be written");
  assert.equal(await fs.access(manifestPath).then(() => true).catch(() => false), true, "package manifest artifact should be written");
  assert.equal(await fs.access(releasePath).then(() => true).catch(() => false), true, "release artifact should be written");
  assert.equal(await fs.access(deploymentPath).then(() => true).catch(() => false), true, "deployment preparation artifact should be written");
  assert.equal(await fs.access(qualityReportPath).then(() => true).catch(() => false), true, "quality gate artifact should be written");
  assert.equal(await fs.access(metricsPath).then(() => true).catch(() => false), true, "metrics artifact should be written");
  assert.equal(await fs.access(auditPath).then(() => true).catch(() => false), true, "audit artifact should be written");
  assert.equal(await fs.access(learningPath).then(() => true).catch(() => false), true, "learning artifact should be written");
  assert.equal(await fs.access(optimizationPath).then(() => true).catch(() => false), true, "optimization artifact should be written");
  assert.equal(await fs.access(summaryPath).then(() => true).catch(() => false), true, "notification summary artifact should be written");
  assert.equal(await fs.access(qualityJsonPath).then(() => true).catch(() => false), true, "validation quality artifact should be written");

  console.log("doctor orchestrator test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
