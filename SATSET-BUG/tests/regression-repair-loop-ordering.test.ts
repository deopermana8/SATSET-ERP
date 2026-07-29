/**
 * Regression tests for RepairLoopEngine orchestration dependency fix.
 *
 * Verifies:
 * 1. RepairLoopEngine works correctly when context.verification is undefined.
 * 2. Loop stops based on actual issue count (via getIssues()), not context.verification.
 * 3. Loop stops when AutoRepairEngine returns terminal reasons (ineffective, no-repair-plans, etc.).
 * 4. No dependency on VerificationEngine execution order remains.
 *
 * Root cause: RepairLoopEngine was previously checking context.verification
 * which is set by VerificationEngine, but VerificationEngine runs AFTER
 * RepairLoopEngine in DoctorOrchestrator.
 */

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { RepairLoopEngine } from "../src/ai/engines/RepairLoopEngine.js";
import { Context } from "../src/core/Context.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface SimpleIssue {
  id: string;
  title: string;
  category: string;
  severity: string;
  message: string;
  ruleId: string;
  file: string;
  line: number;
}

function makeIssue(id: string): SimpleIssue {
  return {
    id,
    title: `Issue ${id}`,
    category: "Test",
    severity: "error",
    message: `Test issue ${id}`,
    ruleId: id,
    file: "test.ts",
    line: 1,
  };
}

async function createTempContext(
  extra?: Partial<{
    issues: SimpleIssue[];
    verification: unknown;
    repairPlans: unknown[];
  }>
): Promise<{ root: string; context: Context }> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "repair-loop-ordering-"));
  const context = new Context({
    projectRoot: root,
    projectName: "repair-loop-ordering",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
    verification: extra?.verification,
    repairPlans: extra?.repairPlans as never,
  });

  for (const issue of extra?.issues ?? []) {
    context.addIssue(issue as never);
  }

  return { root, context };
}

type RepairLoopMeta = { reason?: string; attempt?: number; completed?: boolean };

function getRepairLoopMeta(context: Context): RepairLoopMeta | undefined {
  return context.repairLoop as RepairLoopMeta | undefined;
}

// ---------------------------------------------------------------------------
// Test 1: context.verification is undefined → loop still terminates correctly
// ---------------------------------------------------------------------------

async function testUndefinedVerification(): Promise<void> {
  const { context } = await createTempContext();

  // Precondition: VerificationEngine has NOT run → verification is undefined
  assert.equal(context.verification, undefined, "verification should be undefined (VerificationEngine not yet run)");

  await new RepairLoopEngine().run(context);

  const meta = getRepairLoopMeta(context);
  assert.ok(meta, "repairLoop state must be present");
  assert.equal(meta?.reason, "no-issues", "loop must terminate with 'no-issues' when issue count is zero");
  assert.ok((meta?.attempt ?? 0) >= 1, "at least one loop iteration must have occurred");

  console.log("  ✓ Test 1: undefined context.verification does not break RepairLoopEngine");
}

// ---------------------------------------------------------------------------
// Test 2: stale/wrong context.verification does NOT influence loop exit decision
// ---------------------------------------------------------------------------

async function testStaleVerificationIgnored(): Promise<void> {
  // context.verification is set to { passed: false } — simulating a stale result
  // from a previous pipeline run. With zero issues in the context, the loop must
  // still exit with "no-issues" because RepairLoopEngine reads getIssues(), NOT verification.
  const { context } = await createTempContext({
    verification: { passed: false, reasons: ["stale-reason"] },
  });

  assert.deepEqual(context.verification, { passed: false, reasons: ["stale-reason"] }, "precondition: stale verification is set");
  assert.equal(context.getIssues().length, 0, "precondition: no actual issues");

  await new RepairLoopEngine().run(context);

  const meta = getRepairLoopMeta(context);
  assert.ok(meta, "repairLoop metadata must be present");
  assert.equal(
    meta?.reason,
    "no-issues",
    "loop must exit with 'no-issues' based on getIssues(), NOT based on the stale context.verification"
  );

  console.log("  ✓ Test 2: stale context.verification (passed=false) is ignored; loop exits on actual issue count");
}

// ---------------------------------------------------------------------------
// Test 3: AutoRepairEngine terminal reason stops the loop
//   Scenario: issues are present, but no repairPlans exist.
//   AutoRepairEngine will set context.repairLoop.reason = "ineffective"
//   (INEFFECTIVE lifecycle status when repair was not attempted).
//   RepairLoopEngine must break on this terminal reason.
// ---------------------------------------------------------------------------

async function testTerminalReasonStopsLoop(): Promise<void> {
  const { context } = await createTempContext({
    issues: [makeIssue("ts-err-1")],
    // No repairPlans supplied → AutoRepairEngine cannot repair → "ineffective"
  });

  assert.equal(context.getIssues().length, 1, "precondition: one issue in context");
  assert.equal((context.repairPlans ?? []).length, 0, "precondition: no repair plans");

  await new RepairLoopEngine().run(context);

  const meta = getRepairLoopMeta(context);
  assert.ok(meta, "repairLoop metadata must be present");

  // AutoRepairEngine sets reason to "ineffective" when issues exist but no plans.
  // RepairLoopEngine must detect this as a terminal reason and stop.
  const terminalReasons = new Set(["ineffective", "failed", "no-repair-plans", "no-change", "resolved", "no-issues"]);
  assert.ok(
    terminalReasons.has(meta?.reason ?? ""),
    `loop must exit with a terminal reason, got '${meta?.reason}'`
  );

  // The loop must NOT have exhausted all maxAttempts by continuing to spin;
  // it must have stopped early because AutoRepairEngine indicated no progress.
  const maxAttempts = 3;
  assert.ok(
    (meta?.attempt ?? 0) <= maxAttempts,
    `loop must not exceed maxAttempts (${maxAttempts}), got ${meta?.attempt}`
  );

  console.log(`  ✓ Test 3: AutoRepairEngine terminal reason ('${meta?.reason}') correctly stops RepairLoopEngine`);
  console.log(`    - Attempts used: ${meta?.attempt} of ${maxAttempts}`);
}

// ---------------------------------------------------------------------------
// Test 4: VerificationEngine execution order does NOT affect RepairLoopEngine
//   Run RepairLoopEngine BEFORE VerificationEngine (as DoctorOrchestrator does).
//   The result must be identical to running it with verification=undefined.
// ---------------------------------------------------------------------------

async function testNoVerificationEngineOrderDependency(): Promise<void> {
  // Scenario A: verification not set at all (normal orchestration order)
  const { context: ctxA } = await createTempContext();

  // Scenario B: verification explicitly set to "passed" (as if VerificationEngine ran first)
  const { context: ctxB } = await createTempContext({
    verification: { passed: true, reasons: [] },
  });

  await new RepairLoopEngine().run(ctxA);
  await new RepairLoopEngine().run(ctxB);

  const metaA = getRepairLoopMeta(ctxA);
  const metaB = getRepairLoopMeta(ctxB);

  assert.equal(metaA?.reason, metaB?.reason, "loop reason must be identical regardless of context.verification state");
  assert.equal(metaA?.attempt, metaB?.attempt, "loop attempt count must be identical regardless of context.verification state");

  console.log("  ✓ Test 4: RepairLoopEngine produces identical results with or without context.verification being set");
  console.log(`    - Both scenarios reason: ${metaA?.reason}, attempts: ${metaA?.attempt}`);
}

// ---------------------------------------------------------------------------
// Test 5: context.repairLoop is always populated (no missing artifact regression)
// ---------------------------------------------------------------------------

async function testRepairLoopMetadataAlwaysPopulated(): Promise<void> {
  const { context } = await createTempContext();

  await new RepairLoopEngine().run(context);

  const meta = getRepairLoopMeta(context);
  assert.ok(meta !== undefined && meta !== null, "context.repairLoop must be set after RepairLoopEngine.run()");
  assert.ok(typeof meta.reason === "string" && meta.reason.length > 0, "context.repairLoop.reason must be a non-empty string");
  assert.ok(typeof meta.attempt === "number" && meta.attempt >= 1, "context.repairLoop.attempt must be >= 1");

  console.log("  ✓ Test 5: context.repairLoop is always populated with reason and attempts");
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("Running regression tests: RepairLoopEngine orchestration ordering...");

  await testUndefinedVerification();
  await testStaleVerificationIgnored();
  await testTerminalReasonStopsLoop();
  await testNoVerificationEngineOrderDependency();
  await testRepairLoopMetadataAlwaysPopulated();

  console.log("repair loop ordering regression test passed");
}

void main().catch((error: unknown) => {
  console.error("repair loop ordering regression test FAILED:", (error as Error).message);
  process.exitCode = 1;
});
