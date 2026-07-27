import assert from "node:assert/strict";
import { test } from "node:test";
import { Context } from "../src/core/Context.js";
import { VerificationEngine } from "../src/doctor/VerificationEngine.js";
import { HealthEngine } from "../src/health/HealthEngine.js";
import { ConsoleReporter } from "../src/report/ConsoleReporter.js";
import { deriveRepairLifecycleState, reasonToStatus, statusToLoopReason, type RepairLifecycleStatus } from "../src/repair/RepairLifecycle.js";

function createIssue(id: string): ReturnType<Context["addIssue"]> extends void ? never : never {
  return {
    id,
    title: `Issue ${id}`,
    category: "Prisma",
    severity: "critical",
    message: `Issue ${id}`,
    ruleId: id,
    file: "schema.prisma",
    line: 1,
  } as never;
}

async function createContextForStatus(status: RepairLifecycleStatus): Promise<Context> {
  const context = new Context({
    projectRoot: ".",
    projectName: "repair-propagation",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root: "." },
  });

  const remainingIssues = status === "ALREADY_HEALTHY" || status === "RESOLVED" ? [] : [createIssue("remaining-issue")];
  for (const issue of remainingIssues) {
    context.addIssue(issue);
  }

  const beforeIssues = status === "PARTIALLY_RESOLVED"
    ? [createIssue("before-issue"), createIssue("remaining-issue")]
    : status === "ALREADY_HEALTHY"
      ? []
      : [createIssue("before-issue")];

  const lifecycle = deriveRepairLifecycleState({
    beforeIssues,
    afterIssues: remainingIssues,
    repairAttempted: true,
    repairExecutionSucceeded: status !== "FAILED",
    repairSkipped: status === "SKIPPED",
    repairAttemptCount: 1,
    actualRepairAction: "test-action",
    failedIssueIds: status === "FAILED" ? ["step-1"] : [],
  });

  context.repairLoop = {
    attempt: 1,
    completed: true,
    reason: statusToLoopReason(lifecycle.repairStatus),
  };
  context.repairSummary = {
    beforeIssueCount: lifecycle.beforeIssueIds.length,
    afterIssueCount: lifecycle.afterIssueIds.length,
    beforeHealth: 100,
    afterHealth: 100,
    fixedIssueCount: lifecycle.resolvedIssueIds.length,
    remainingIssueCount: lifecycle.remainingIssueIds.length,
    repairStatus: lifecycle.repairStatus,
    verificationPassed: lifecycle.verificationPassed,
    verificationReasons: lifecycle.verificationReasons,
  };
  context.diagnosis = context.getIssues().map((issue) => ({ id: issue.id, title: issue.title, confidence: 90 }));
  context.rootCauses = [{ id: "root-cause-1", title: "root cause", confidence: 100, description: "description", causes: ["cause"], evidence: [context.getIssues()[0] as never], repairSteps: ["repair"], priority: 100 } as never];
  context.repairPlans = [{ id: "repair-plan-1", rootCauseId: "root-cause-1", title: "repair plan", description: "repair plan", steps: [{ id: "step-1", title: "repair", description: "repair", automatic: true, estimatedTime: 60, risk: "low" as const, dependsOn: [] }], totalEstimatedTime: 60, priority: 100 } as never];
  return context;
}

test("repair lifecycle outcomes remain semantically consistent across verification health and reporting", async () => {
  const states: RepairLifecycleStatus[] = ["ALREADY_HEALTHY", "RESOLVED", "PARTIALLY_RESOLVED", "INEFFECTIVE", "FAILED", "SKIPPED"];

  for (const status of states) {
    const context = await createContextForStatus(status);
    const verificationEngine = new VerificationEngine();
    const healthEngine = new HealthEngine();
    const reporter = new ConsoleReporter();

    await verificationEngine.run(context);
    await healthEngine.run(context);

    const verification = context.verification as { passed?: boolean; reasons?: string[] } | undefined;
    const repairStatus = reasonToStatus(context.repairLoop?.reason);
    assert.equal(repairStatus, status, `${status} should map back to the same lifecycle status`);

    const expectedVerificationPassed = status === "ALREADY_HEALTHY" || status === "RESOLVED";
    assert.equal(verification?.passed, expectedVerificationPassed, `${status} should only pass verification for already healthy or resolved states`);

    if (status === "ALREADY_HEALTHY" || status === "RESOLVED") {
      assert.equal(context.health?.score, 100, `${status} should preserve a healthy score when the repair outcome is fully resolved`);
    } else if (status === "PARTIALLY_RESOLVED") {
      assert.ok(context.health?.score !== undefined && context.health.score < 100 && context.health.score >= 90, `${status} should retain a slightly reduced but still strong health score`);
    } else {
      assert.ok(context.health?.score !== undefined && context.health.score < 100, `${status} should reduce the health score when the repair is not fully successful`);
    }

    const output: string[] = [];
    const originalConsoleLog = console.log;
    console.log = (...args: unknown[]) => {
      output.push(args.join(" "));
    };
    try {
      reporter.report(context);
    } finally {
      console.log = originalConsoleLog;
    }

    const reporterText = output.join("\n");
    assert.match(reporterText, new RegExp(`Repair status: ${status}`), `${status} should be reported consistently in the console output`);
  }
});
