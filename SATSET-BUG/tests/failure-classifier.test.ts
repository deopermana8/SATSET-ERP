import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { Context } from "../src/core/Context.js";
import { FailureClassifierEngine } from "../src/doctor/FailureClassifierEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-failure-classifier-"));
  const context = new Context({
    projectRoot: root,
    projectName: "failure-classifier",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root,
      buildLoop: {
        report: {
          compilerResult: { diagnostics: ["TS2339: Property foo does not exist on type bar"] },
        },
      },
    },
  });

  await new FailureClassifierEngine().run(context);
  const failure = (context.metadata as Record<string, unknown>).failureReport as { category: string; severity: string };

  assert.equal(failure.category, "typescript");
  assert.equal(failure.severity, "high");
  console.log("failure classifier test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
