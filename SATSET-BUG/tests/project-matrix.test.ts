import assert from "node:assert/strict";
import { ProjectMatrix } from "../src/validation/ProjectMatrix.js";

async function main(): Promise<void> {
  const matrix = new ProjectMatrix();
  matrix.markValidated("POS", 85);
  const entries = matrix.getEntries();
  const pos = entries.find((entry) => entry.name === "POS");
  assert.ok(pos);
  assert.equal(pos?.status, "validated");
  assert.equal(pos?.score, 85);
  console.log("project matrix test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
