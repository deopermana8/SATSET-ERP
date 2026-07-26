import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");

async function main(): Promise<void> {
  const reportPath = path.join(workspaceRoot, "stress-report.json");
  const performancePath = path.join(workspaceRoot, "performance.json");
  const memoryPath = path.join(workspaceRoot, "memory-report.json");
  const snapshotPath = path.join(workspaceRoot, "tests", "__snapshots__", "doctor.snapshot.json");

  const [stressReportRaw, performanceRaw, memoryRaw, snapshotRaw] = await Promise.all([
    fs.readFile(reportPath, "utf8"),
    fs.readFile(performancePath, "utf8"),
    fs.readFile(memoryPath, "utf8"),
    fs.readFile(snapshotPath, "utf8"),
  ]);

  const stressReport = JSON.parse(stressReportRaw);
  const performance = JSON.parse(performanceRaw);
  const memoryReport = JSON.parse(memoryRaw);
  const snapshot = JSON.parse(snapshotRaw);

  assert.equal(stressReport.validation.fingerprintsIdentical, true, "fingerprints must be identical");
  assert.equal(stressReport.validation.healthScoresIdentical, true, "health scores must be identical");
  assert.equal(stressReport.validation.issueIdsIdentical, true, "issue IDs must be identical");
  assert.equal(stressReport.validation.repairPlansIdentical, true, "repair plans must be identical");
  assert.equal(stressReport.validation.verificationIdentical, true, "verification results must be identical");
  assert.ok(performance.Scanner?.average !== undefined, "performance metrics should be available");
  assert.ok(memoryReport.summary.stable, "memory growth should remain within a stable threshold");
  assert.deepEqual(snapshot.summary, {
    fingerprint: stressReport.runs[0].fingerprint,
    healthScore: stressReport.runs[0].healthScore,
    issueCount: stressReport.runs[0].issueCount,
    repairPlanCount: stressReport.runs[0].repairPlanCount,
  });

  console.log("doctor reliability test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
