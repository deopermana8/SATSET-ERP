import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import type { Issue } from "../core/Issue.js";
import type { Diagnosis } from "../diagnostic/Diagnosis.js";
// RepairPlan type is inferred from planner output and not required here
import type { RootCause } from "../rootcause/RootCause.js";
import { HealthEngine } from "../health/HealthEngine.js";
import type { HealthSummary } from "../health/HealthSummary.js";
import { deriveRepairLifecycleState, reasonToStatus, statusToLoopReason } from "../repair/RepairLifecycle.js";

export interface VerificationCheck {
  name: string;
  passed: boolean;
  reason: string;
  details?: Record<string, unknown>;
}

export interface VerificationResult {
  passed: boolean;
  checks: VerificationCheck[];
  reasons: string[];
}

export class VerificationEngine implements IEngine {
  public readonly name = "VerificationEngine";

  async run(context: Context): Promise<void> {
    const result = this.verifyAll(context);
    context.verification = result;

    const healthEngine = new HealthEngine();
    await healthEngine.run(context);
  }

  private verifyAll(context: Context): VerificationResult {
    const checks = [
      this.verifyDiagnosis(context),
      this.verifyRepairPlan(context),
      this.verifyIssueConsistency(context),
      this.verifyRepairOutcome(context),
      this.verifyHealthScore(context),
    ];

    const reasons = checks.filter((check) => !check.passed).map((check) => check.reason);
    return {
      passed: reasons.length === 0,
      checks,
      reasons,
    };
  }

  private verifyDiagnosis(context: Context): VerificationCheck {
    const issues = context.getIssues();
    const diagnosis = context.diagnosis ?? [];

    if (issues.length === 0 && diagnosis.length === 0) {
      return {
        name: "diagnosis",
        passed: true,
        reason: "No issues were found, and the diagnosis list is empty.",
      };
    }

    if (issues.length > 0 && diagnosis.length === 0) {
      return {
        name: "diagnosis",
        passed: false,
        reason: "Diagnosis is missing while issues were detected.",
      };
    }

    const issueIds = new Set(issues.map((issue) => issue.id));
    const invalid = diagnosis.filter((entry) => !issueIds.has(entry.id)).map((entry) => entry.id);
    if (invalid.length > 0) {
      return {
        name: "diagnosis",
        passed: false,
        reason: `Diagnosis contains references to unknown issues: ${invalid.join(", ")}`,
        details: { unknownIssueIds: invalid },
      };
    }

    const duplicateIds = diagnosis.length !== new Set(diagnosis.map((entry) => entry.id)).size;
    if (duplicateIds) {
      return {
        name: "diagnosis",
        passed: false,
        reason: "Duplicate diagnosis identifiers were detected.",
      };
    }

    return {
      name: "diagnosis",
      passed: true,
      reason: "Diagnosis entries are consistent with detected issues.",
    };
  }

  private verifyRepairPlan(context: Context): VerificationCheck {
    const rootCauses = context.rootCauses ?? [];
    const repairPlans = context.repairPlans ?? [];

    if (rootCauses.length === 0 && repairPlans.length === 0) {
      return {
        name: "repairPlan",
        passed: true,
        reason: "No root causes were identified and no repair plans are required.",
      };
    }

    if (rootCauses.length > 0 && repairPlans.length === 0) {
      return {
        name: "repairPlan",
        passed: false,
        reason: "Repair plans are missing for identified root causes.",
      };
    }

    const rootCauseIds = new Set(rootCauses.map((cause) => cause.id));
    const invalidPlans = repairPlans.filter((plan) => !rootCauseIds.has(plan.rootCauseId)).map((plan) => plan.id);
    if (invalidPlans.length > 0) {
      return {
        name: "repairPlan",
        passed: false,
        reason: `Some repair plans reference unknown root cause ids: ${invalidPlans.join(", ")}`,
        details: { invalidRepairPlanIds: invalidPlans },
      };
    }

    if (repairPlans.length !== rootCauses.length) {
      return {
        name: "repairPlan",
        passed: false,
        reason: "Expected one repair plan for each root cause, but the counts differ.",
        details: { rootCauseCount: rootCauses.length, repairPlanCount: repairPlans.length },
      };
    }

    const emptySteps = repairPlans.filter((plan) => !plan.steps || plan.steps.length === 0).map((plan) => plan.id);
    if (emptySteps.length > 0) {
      return {
        name: "repairPlan",
        passed: false,
        reason: `Some repair plans have no steps: ${emptySteps.join(", ")}`,
        details: { emptyStepPlanIds: emptySteps },
      };
    }

    return {
      name: "repairPlan",
      passed: true,
      reason: "Repair plans are consistent with identified root causes.",
    };
  }

  private verifyIssueConsistency(context: Context): VerificationCheck {
    const issues = context.getIssues();
    const diagnosis = context.diagnosis ?? [];
    const rootCauses = context.rootCauses ?? [];
    const issueIds = new Set<string>();
    const duplicateIssueIds = new Set<string>();

    for (const issue of issues) {
      if (!issue.id || !issue.message) {
        return {
          name: "issueConsistency",
          passed: false,
          reason: "Every issue must have a non-empty id and message.",
        };
      }
      if (issueIds.has(issue.id)) {
        duplicateIssueIds.add(issue.id);
      }
      issueIds.add(issue.id);
    }

    if (duplicateIssueIds.size > 0) {
      return {
        name: "issueConsistency",
        passed: false,
        reason: `Duplicate issue ids detected: ${Array.from(duplicateIssueIds).join(", ")}`,
      };
    }

    if (diagnosis.length > 0) {
      const diagnosisIds = diagnosis.map((entry) => entry.id);
      const missing = diagnosisIds.filter((id) => !issueIds.has(id));
      if (missing.length > 0) {
        return {
          name: "issueConsistency",
          passed: false,
          reason: `Diagnosis references issue ids that are not present: ${missing.join(", ")}`,
          details: { missingIssueIds: missing },
        };
      }
    }

    if (rootCauses.length > 0) {
      if (issueIds.size === 0) {
        return {
          name: "issueConsistency",
          passed: true,
          reason: "No active issues remain; historical root cause evidence is not relevant.",
        };
      }

      const evidenceIds = new Set(rootCauses.flatMap((rootCause) => rootCause.evidence.map((issue) => issue.id)));
      const invalidEvidence = Array.from(evidenceIds).filter((id) => !issueIds.has(id));
      if (invalidEvidence.length > 0) {
        return {
          name: "issueConsistency",
          passed: false,
          reason: `Root cause evidence refers to unknown issue ids: ${invalidEvidence.join(", ")}`,
          details: { invalidEvidenceIds: invalidEvidence },
        };
      }
    }

    return {
      name: "issueConsistency",
      passed: true,
      reason: "Issue metadata and references are consistent.",
    };
  }

  private verifyRepairOutcome(context: Context): VerificationCheck {
    const repairLoop = context.repairLoop;
    const currentIssueCount = context.getIssues().length;
    const beforeIssueCount = context.repairSummary?.beforeIssueCount ?? context.repairSummary?.beforeIssueIds?.length ?? currentIssueCount;
    const afterIssueCount = context.repairSummary?.afterIssueCount ?? currentIssueCount;
    const repairStatus = reasonToStatus(repairLoop?.reason);

    if (!repairLoop || repairLoop.reason === "started") {
      return {
        name: "repairOutcome",
        passed: true,
        reason: "No repair outcome was recorded yet.",
      };
    }

    if (repairStatus === "ALREADY_HEALTHY") {
      if (currentIssueCount > 0) {
        return {
          name: "repairOutcome",
          passed: false,
          reason: `Repair reported already healthy but the current issue state still contains ${currentIssueCount} unresolved issue(s).`,
          details: { beforeIssueCount, afterIssueCount, currentIssueCount, reason: repairLoop.reason },
        };
      }

      return {
        name: "repairOutcome",
        passed: true,
        reason: "No repair was required because the issue state was already healthy.",
      };
    }

    if (repairStatus === "RESOLVED") {
      if (currentIssueCount > 0) {
        return {
          name: "repairOutcome",
          passed: false,
          reason: `Repair reported resolved but the current issue state still contains ${currentIssueCount} unresolved issue(s).`,
          details: { beforeIssueCount, afterIssueCount, currentIssueCount, reason: repairLoop.reason },
        };
      }

      if (beforeIssueCount > 0 && afterIssueCount > 0 && afterIssueCount < beforeIssueCount) {
        return {
          name: "repairOutcome",
          passed: false,
          reason: `Repair partially resolved the issue state: before=${beforeIssueCount}, after=${afterIssueCount}.`,
          details: { beforeIssueCount, afterIssueCount, currentIssueCount, reason: repairLoop.reason },
        };
      }

      return {
        name: "repairOutcome",
        passed: true,
        reason: "Repair outcome indicates the targeted issue was resolved.",
      };
    }

    if (repairStatus === "PARTIALLY_RESOLVED") {
      return {
        name: "repairOutcome",
        passed: false,
        reason: `Repair partially resolved the issue state: before=${beforeIssueCount}, after=${afterIssueCount}.`,
        details: { beforeIssueCount, afterIssueCount, currentIssueCount, reason: repairLoop.reason },
      };
    }

    if (beforeIssueCount > 0 && afterIssueCount >= beforeIssueCount && (repairStatus === "INEFFECTIVE" || repairStatus === "FAILED" || repairStatus === "SKIPPED" || repairLoop.reason === "no-change" || repairLoop.reason === "no-repair-needed")) {
      return {
        name: "repairOutcome",
        passed: false,
        reason: `Repair did not improve the issue state: before=${beforeIssueCount}, after=${afterIssueCount}.`,
        details: { beforeIssueCount, afterIssueCount, currentIssueCount, reason: repairLoop.reason },
      };
    }

    return {
        name: "repairOutcome",
        passed: true,
        reason: "Repair outcome is consistent with the current issue state.",
      };
  }

  private verifyHealthScore(context: Context): VerificationCheck {
    const health = context.health;
    const issues = context.getIssues();
    const diagnosis = context.diagnosis ?? [];
    const repairPlans = context.repairPlans ?? [];
    const rootCauses = context.rootCauses ?? [];

    const counts = this.countBySeverity(issues);
    const diagnosisConfidence = diagnosis.length > 0 ? Math.max(...diagnosis.map((d) => d.confidence ?? 0)) : 0;
    const verificationPassed = reasonToStatus(context.repairLoop?.reason) === "RESOLVED" || reasonToStatus(context.repairLoop?.reason) === "ALREADY_HEALTHY";
    const expectedScore = this.calculateScore(counts, diagnosisConfidence, rootCauses.length, repairPlans.length, verificationPassed);
    const expectedGrade = this.determineGrade(expectedScore);
    const expectedStatus = this.determineStatus(expectedScore);

    if (!health) {
      return {
        name: "healthScore",
        passed: true,
        reason: "Health summary will be generated from the current diagnostics and repair state.",
        details: { expectedScore, expectedGrade, expectedStatus },
      };
    }

    if (health.score !== expectedScore) {
      return {
        name: "healthScore",
        passed: false,
        reason: `Health score mismatch: expected ${expectedScore}, got ${health.score}.`,
        details: { expectedScore, actualScore: health.score },
      };
    }

    if (health.grade !== expectedGrade) {
      return {
        name: "healthScore",
        passed: false,
        reason: `Health grade mismatch: expected ${expectedGrade}, got ${health.grade}.`,
        details: { expectedGrade, actualGrade: health.grade },
      };
    }

    if (health.status !== expectedStatus) {
      return {
        name: "healthScore",
        passed: false,
        reason: `Health status mismatch: expected ${expectedStatus}, got ${health.status}.`,
        details: { expectedStatus, actualStatus: health.status },
      };
    }

    return {
      name: "healthScore",
      passed: true,
      reason: "Health score and summary are consistent with diagnostics and repair state.",
    };
  }

  private countBySeverity(issues: readonly Issue[]): {
    critical: number;
    error: number;
    warning: number;
    info: number;
  } {
    return issues.reduce(
      (counts, issue) => {
        switch (issue.severity.toLowerCase()) {
          case "critical":
            counts.critical += 1;
            break;
          case "error":
            counts.error += 1;
            break;
          case "warning":
            counts.warning += 1;
            break;
          default:
            counts.info += 1;
            break;
        }
        return counts;
      },
      { critical: 0, error: 0, warning: 0, info: 0 }
    );
  }

  private calculateScore(
    counts: { critical: number; error: number; warning: number; info: number },
    diagnosisConfidence: number,
    rootCauseCount: number,
    repairPlanCount: number,
    verificationPassed: boolean
  ): number {
    let score = 100;
    score -= counts.critical * 20;
    score -= counts.error * 10;
    score -= counts.warning * 5;

    if (diagnosisConfidence > 0) {
      score += Math.min(20, Math.round(diagnosisConfidence / 10));
    }

    if (rootCauseCount > 0) {
      const coverageRatio = repairPlanCount / rootCauseCount;
      score += Math.min(20, Math.round(coverageRatio * 10));
    }

    if (verificationPassed) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private determineGrade(score: number): string {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  }

  private determineStatus(score: number): string {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    if (score >= 60) return "Poor";
    return "Critical";
  }
}
