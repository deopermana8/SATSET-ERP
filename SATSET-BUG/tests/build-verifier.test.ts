import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { BuildVerifier } from "../src/doctor/BuildVerifier.js";
import type { CompileResult } from "../src/doctor/CompileResult.js";

function createCompileResult(): CompileResult {
  return {
    succeeded: true,
    exitCode: 0,
    stdout: "",
    stderr: "",
    diagnostics: [],
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
  };
}

async function createContext(root: string): Promise<Context> {
  return new Context({
    projectRoot: root,
    projectName: "build-verifier",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });
}

async function main(): Promise<void> {
  const passRoot = await fs.mkdtemp(path.join(os.tmpdir(), "build-verifier-pass-"));
  const passContext = await createContext(passRoot);
  passContext.metadata = {
    ...passContext.metadata,
    test: {
      unitExitCode: 0,
      integrationExitCode: 0,
      e2eExitCode: null,
      coverage: 90,
      durationMs: 1,
      failedTests: [],
      logs: [],
    },
  } as typeof passContext.metadata & { test?: Record<string, unknown> };

  const passResult = await new BuildVerifier().verify(passContext, createCompileResult());
  assert.equal(passResult.testsPassed, true, "tests should pass when recorded exit codes are zero");
  assert.equal(passResult.verificationPassed, true, "verification should pass with healthy context");
  assert.equal(passResult.summary, "Build verified", "summary should reflect all gate results");

  const failRoot = await fs.mkdtemp(path.join(os.tmpdir(), "build-verifier-fail-"));
  const failContext = await createContext(failRoot);
  failContext.metadata = {
    ...failContext.metadata,
    test: {
      unitExitCode: 0,
      integrationExitCode: 1,
      e2eExitCode: null,
      coverage: 90,
      durationMs: 1,
      failedTests: ["factory-flow"],
      logs: ["failed"],
    },
  } as typeof failContext.metadata & { test?: Record<string, unknown> };

  const failResult = await new BuildVerifier().verify(failContext, createCompileResult());
  assert.equal(failResult.testsPassed, false, "tests should fail when integration exit code is non-zero");
  assert.equal(failResult.verificationPassed, true, "verification should still reflect the current repair state");
  assert.equal(failResult.summary, "Build verification failed", "summary must fail when tests fail");

  console.log("build verifier regression test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
