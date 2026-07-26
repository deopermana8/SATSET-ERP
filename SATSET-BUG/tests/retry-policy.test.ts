import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { Context } from "../src/core/Context.js";
import { RetryPolicyEngine } from "../src/doctor/RetryPolicyEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-retry-policy-"));
  const context = new Context({
    projectRoot: root,
    projectName: "retry-policy",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root,
      failureReport: { category: "runtime", errors: ["Error: timeout"] },
      patchValidation: { valid: false },
    },
  });

  await new RetryPolicyEngine().run(context);
  const retry = (context.metadata as Record<string, unknown>).retryPolicy as { maxAttempts: number; backoffMs: number; shouldRetry: boolean };

  assert.equal(retry.maxAttempts, 3);
  assert.equal(retry.backoffMs, 200);
  assert.equal(retry.shouldRetry, true);
  console.log("retry policy test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
