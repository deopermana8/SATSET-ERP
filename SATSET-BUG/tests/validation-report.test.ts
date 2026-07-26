import assert from "node:assert/strict";
import { ValidationReport } from "../src/validation/ValidationReport.js";

async function main(): Promise<void> {
  const report = ValidationReport.fromPayload({
    compileSuccess: true,
    testSuccess: true,
    repairSuccess: true,
    benchmarkScore: 88,
    releaseStatus: "READY",
    executionDurationMs: 1000,
    artifactsGenerated: ["src/app.ts"],
  });

  assert.equal(report.releaseStatus, "READY");
  assert.equal(report.benchmarkScore, 88);
  console.log("validation report test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
