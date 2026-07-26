import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { BuildLoopEngine } from "../src/doctor/BuildLoopEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-build-loop-"));
  const context = new Context({
    projectRoot: root,
    projectName: "build-loop",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  await new BuildLoopEngine().run(context);

  const buildLoop = (context.metadata as Record<string, unknown>).buildLoop as {
    state: { status: string; stage: string; attempt: number };
    report: {
      compilerResult: { succeeded: boolean };
      testResults: Array<{ name: string; passed: boolean }>;
      summary: { status: string };
    };
  };

  assert.ok(buildLoop, "build loop metadata should be attached to context");
  assert.ok(buildLoop.state, "build state should be available");
  assert.ok(["completed", "failed", "recovered"].includes(buildLoop.state.status), "build loop should reach a terminal state");
  assert.ok(buildLoop.report.compilerResult, "compiler result should be captured");
  assert.ok(Array.isArray(buildLoop.report.testResults), "test results should be captured");
  assert.ok(buildLoop.report.summary, "build loop summary should be present");

  console.log("build loop test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
