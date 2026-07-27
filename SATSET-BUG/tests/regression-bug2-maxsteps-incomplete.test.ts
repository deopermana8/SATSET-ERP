import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { RepairEngine } from "../src/planner/RepairEngine.js";
import { deriveRepairLifecycleState } from "../src/repair/RepairLifecycle.js";

interface Issue {
  id: string;
  title: string;
  category: string;
  severity: string;
  message: string;
  ruleId: string;
  file: string;
  line: number;
}

function createIssue(id: string): Issue {
  return {
    id,
    title: `Issue ${id}`,
    category: "Test",
    severity: "critical",
    message: `Issue ${id}`,
    ruleId: id,
    file: "test.ts",
    line: 1,
  };
}

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "repair-maxsteps-"));
  const context = new Context({
    projectRoot: root,
    projectName: "repair-maxsteps",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  // Set up a scenario with multiple issues that would all be resolved if we had unlimited steps
  const issues = [createIssue("issue-1"), createIssue("issue-2"), createIssue("issue-3")];
  for (const issue of issues) {
    context.addIssue(issue);
  }

  // Create a repair plan with many steps, but limit execution to 2 steps
  context.repairPlans = [
    {
      id: "plan-1",
      rootCauseId: "cause-1",
      title: "Test plan",
      description: "Test plan with many steps",
      steps: [
        { id: "step-1", title: "step 1", description: "do something", automatic: true, estimatedTime: 10, risk: "low", dependsOn: [] },
        { id: "step-2", title: "step 2", description: "do something", automatic: true, estimatedTime: 10, risk: "low", dependsOn: [] },
        { id: "step-3", title: "step 3", description: "do something", automatic: true, estimatedTime: 10, risk: "low", dependsOn: [] },
        { id: "step-4", title: "step 4", description: "do something", automatic: true, estimatedTime: 10, risk: "low", dependsOn: [] },
        { id: "step-5", title: "step 5", description: "do something", automatic: true, estimatedTime: 10, risk: "low", dependsOn: [] },
      ],
      totalEstimatedTime: 50,
      priority: 100,
    },
  ] as never;

  // Set maxSteps to 2, so only 2 steps will execute out of 5
  context.repairOptions = { maxSteps: 2 };

  // Run the repair engine
  const repairEngine = new RepairEngine();
  await repairEngine.run(context);

  // Check that execution was marked as incomplete
  const executionCompleted = (context.metadata as Record<string, unknown>).repairExecutionCompleted;
  assert.equal(executionCompleted, false, "repairExecutionCompleted should be false when maxSteps is hit");

  // Simulate the scenario where issues would appear resolved (for testing lifecycle logic)
  // Check that when execution is incomplete, we don't get RESOLVED status
  const simulatedAfterIssues: Issue[] = [];
  const lifecycle = deriveRepairLifecycleState({
    beforeIssues: issues,
    afterIssues: simulatedAfterIssues,
    repairAttempted: true,
    repairExecutionSucceeded: true,
    executionCompleted: false, // This is the key: execution was incomplete
  });

  assert.notEqual(lifecycle.repairStatus, "RESOLVED", "repairStatus must NOT be RESOLVED when execution was incomplete");
  assert.equal(lifecycle.repairStatus, "PARTIALLY_RESOLVED", "repairStatus should be PARTIALLY_RESOLVED when execution was incomplete");
  assert.equal(lifecycle.verificationPassed, false, "verification should NOT pass when execution was incomplete");

  // Also verify that when execution IS complete, we do get RESOLVED
  const lifecycleComplete = deriveRepairLifecycleState({
    beforeIssues: issues,
    afterIssues: simulatedAfterIssues,
    repairAttempted: true,
    repairExecutionSucceeded: true,
    executionCompleted: true, // Execution was complete
  });

  assert.equal(lifecycleComplete.repairStatus, "RESOLVED", "repairStatus should be RESOLVED when execution was complete and issues cleared");
  assert.equal(lifecycleComplete.verificationPassed, true, "verification should pass when execution was complete and issues cleared");

  console.log("✓ Regression Test 2 PASSED: maxSteps prevents false RESOLVED status");
  console.log(`  - Incomplete execution status: ${lifecycle.repairStatus} (verification passed: ${lifecycle.verificationPassed})`);
  console.log(`  - Complete execution status: ${lifecycleComplete.repairStatus} (verification passed: ${lifecycleComplete.verificationPassed})`);
}

void main().catch((error) => {
  console.error("✗ Regression Test 2 FAILED:", error.message);
  process.exitCode = 1;
});
