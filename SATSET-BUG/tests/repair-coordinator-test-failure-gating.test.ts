import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { RepairCoordinator } from "../src/doctor/RepairCoordinator.js";
import { BuildVerifier } from "../src/doctor/BuildVerifier.js";
import type { CompileEngine } from "../src/ai/engines/CompileEngine.js";
import type { TestEngine } from "../src/ai/engines/TestEngine.js";
import type { ErrorClassifier } from "../src/doctor/ErrorClassifier.js";
import type { PatchPlanner } from "../src/doctor/PatchPlanner.js";
import type { PatchGenerator } from "../src/doctor/PatchGenerator.js";
import type { PatchApplier } from "../src/doctor/PatchApplier.js";

class StubCompileEngine {
  async run(context: Context): Promise<void> {
    context.metadata = {
      ...context.metadata,
      compile: {
        timestamp: new Date().toISOString(),
        diagnostics: [],
        exitCode: 0,
        toolchain: ["typescript"],
      },
    } as typeof context.metadata & { compile?: Record<string, unknown> };
  }
}

class StubTestEngine {
  constructor(private readonly integrationExitCode: number) {}

  async run(context: Context): Promise<void> {
    context.metadata = {
      ...context.metadata,
      test: {
        unitExitCode: 0,
        integrationExitCode: this.integrationExitCode,
        e2eExitCode: null,
        coverage: 90,
        durationMs: 1,
        failedTests: this.integrationExitCode === 0 ? [] : ["factory-flow"],
        logs: [],
      },
    } as typeof context.metadata & { test?: Record<string, unknown> };
  }
}

class StubErrorClassifier {
  classify(): never[] {
    return [];
  }
}

class StubPatchPlanner {
  plan(): never[] {
    return [];
  }
}

class StubPatchGenerator {
  async generate(): Promise<never[]> {
    return [];
  }
}

class StubPatchApplier {
  async apply(): Promise<never[]> {
    return [];
  }
}

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "repair-coordinator-test-gating-"));
  const context = new Context({
    projectRoot: root,
    projectName: "repair-coordinator-test-gating",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  const coordinator = new RepairCoordinator(
    new StubCompileEngine() as unknown as CompileEngine,
    new StubTestEngine(1) as unknown as TestEngine,
    new StubErrorClassifier() as unknown as ErrorClassifier,
    new StubPatchPlanner() as unknown as PatchPlanner,
    new StubPatchGenerator() as unknown as PatchGenerator,
    new StubPatchApplier() as unknown as PatchApplier,
    new BuildVerifier(),
    { maxAttempts: 1 } as never,
    undefined,
    undefined,
    undefined,
    undefined
  );

  await coordinator.run(context);

  const iteration = context.metadata.repairIterations as Array<{ status?: string }> | undefined;
  assert.ok(iteration, "repair iterations should be recorded");
  assert.equal(iteration?.length, 1, "only one iteration should run with maxAttempts=1");
  assert.equal(iteration?.[0]?.status, "failed", "repair iteration should fail when tests fail");

  const testState = context.metadata.test as { integrationExitCode?: number } | undefined;
  assert.equal(testState?.integrationExitCode, 1, "integration test exit code should be recorded as failing");

  console.log("repair coordinator test gating regression test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
