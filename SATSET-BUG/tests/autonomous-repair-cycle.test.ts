import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { Context } from "../src/core/Context.js";
import { RepairDecisionEngine } from "../src/doctor/RepairDecisionEngine.js";
import { PatchGeneratorEngine } from "../src/doctor/PatchGeneratorEngine.js";
import { PatchValidatorEngine } from "../src/doctor/PatchValidatorEngine.js";
import { RetryPolicyEngine } from "../src/doctor/RetryPolicyEngine.js";
import { FailureClassifierEngine } from "../src/doctor/FailureClassifierEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-autonomous-repair-"));
  const targetFile = path.join(root, "src", "index.ts");
  await fs.mkdir(path.dirname(targetFile), { recursive: true });
  await fs.writeFile(targetFile, "export const value = 1;\n", "utf8");

  const context = new Context({
    projectRoot: root,
    projectName: "autonomous-repair",
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
  await new RepairDecisionEngine().run(context);
  await new PatchGeneratorEngine().run(context);
  await new PatchValidatorEngine().run(context);
  await new RetryPolicyEngine().run(context);

  const failure = (context.metadata as Record<string, unknown>).failureReport as { category: string };
  const decision = (context.metadata as Record<string, unknown>).repairDecision as { strategy: string };
  const patchSummary = (context.metadata as Record<string, unknown>).patchSummary as { applied: number };
  const validation = (context.metadata as Record<string, unknown>).patchValidation as { valid: boolean };
  const retry = (context.metadata as Record<string, unknown>).retryPolicy as { shouldRetry: boolean };

  assert.equal(failure.category, "typescript");
  assert.equal(decision.strategy, "patch-file");
  assert.equal(patchSummary.applied, 1);
  assert.equal(validation.valid, true);
  assert.equal(retry.shouldRetry, true);
  console.log("autonomous repair cycle test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
