import type { Context } from "../core/Context.js";
import type { Issue } from "../core/Issue.js";
import type { IReporter } from "./IReporter.js";
import { reasonToStatus } from "../repair/RepairLifecycle.js";

export class ConsoleReporter implements IReporter {
  public readonly name = "Console Reporter";

  public report(context: Context): Issue[] {
    const summary = context.getSummary();
    const issues = context.getIssues();
    const health = context.health;
    const diagnosis = context.diagnosis ?? [];
    const repairPlans = context.repairPlans ?? [];
    const verification = context.verification as { passed: boolean; reasons?: string[] } | undefined;
    const recommendations = context.recommendations ?? [];
    const repairLoop = context.repairLoop;
    const repairSummary = context.repairSummary;

    console.log("Project:");
    console.log(context.projectRoot);
    console.log("");

    if (health) {
      console.log("Health Score:");
      console.log(`${health.score}`);
      console.log("");
    } else {
      console.log("Health Score:");
      console.log("unknown");
      console.log("");
    }

    console.log("Summary:");
    console.log(`Total: ${summary.total}`);
    console.log(`Critical: ${summary.critical}`);
    console.log(`Errors: ${summary.error}`);
    console.log(`Warnings: ${summary.warning}`);
    console.log("");

    console.log("Diagnosis:");
    if (diagnosis.length > 0) {
      for (const entry of diagnosis) {
        console.log(`- ${entry.id}: ${entry.title} (${entry.confidence || 0}%)`);
      }
    } else {
      console.log("None");
    }
    console.log("");

    console.log("Repair Plans:");
    if (repairPlans.length > 0) {
      for (const plan of repairPlans) {
        console.log(`- ${plan.id}: ${plan.title}`);
        console.log(`  Root cause: ${plan.rootCauseId}`);
        console.log(`  Steps: ${plan.steps.length}`);
      }
    } else {
      console.log("None");
    }
    console.log("");

    console.log("Verification:");
    if (verification) {
      console.log(`Passed: ${verification.passed ? "yes" : "no"}`);
      if (verification.reasons && verification.reasons.length > 0) {
        console.log("Reasons:");
        for (const reason of verification.reasons) {
          console.log(`- ${reason}`);
        }
      }
    } else {
      console.log("None");
    }
    console.log("");

    console.log("Auto Repair:");
    if (repairLoop) {
      console.log(`Attempts: ${repairLoop.attempt}`);
      console.log(`Completed: ${repairLoop.completed ? "yes" : "no"}`);
      console.log(`Reason: ${repairLoop.reason ?? "unknown"}`);
    } else {
      console.log("None");
    }
    if (repairSummary) {
      console.log(`Before issues: ${repairSummary.beforeIssueCount ?? "n/a"}`);
      console.log(`After issues: ${repairSummary.afterIssueCount ?? "n/a"}`);
      console.log(`Repair status: ${reasonToStatus(repairLoop?.reason)}`);
      console.log(`Health delta: ${(repairSummary.afterHealth ?? 0) - (repairSummary.beforeHealth ?? 0)}`);
      console.log(`Rollback: ${repairSummary.rollbackStatus ?? "none"}`);
    }
    console.log("");

    console.log("Recommendations:");
    if (recommendations.length > 0) {
      for (const recommendation of recommendations) {
        console.log(`- ${recommendation}`);
      }
    } else {
      console.log("None");
    }
    console.log("");

    return [...issues];
  }
}
