import type { Context } from "../core/Context.js";
import type { Issue } from "../core/Issue.js";
import type { Diagnosis } from "../diagnostic/Diagnosis.js";
import type { HealthSummary, HealthGrade, HealthStatus } from "./HealthSummary.js";
import type { IEngine } from "../core/IEngine.js";
import { reasonToStatus } from "../repair/RepairLifecycle.js";

interface SeverityCounts {
  critical: number;
  error: number;
  warning: number;
  info: number;
}

export class HealthEngine implements IEngine {
  public readonly name = "HealthEngine";

  async run(context: Context): Promise<void> {
    const issues = context.getIssues();
    const diagnoses = context.diagnosis ?? [];
    const diagnosisConfidence = diagnoses.length > 0 ? Math.max(...diagnoses.map((d) => d.confidence ?? 0)) : 0;
    const counts = this.countBySeverity(issues);
    const repairPlans = context.repairPlans ?? [];
    const rootCauseCount = context.rootCauses?.length ?? 0;
    const verificationPassed = Boolean(
      context.verification &&
        typeof context.verification === "object" &&
        "passed" in context.verification &&
        (context.verification as { passed: boolean }).passed
    );
    const repairStatus = reasonToStatus(context.repairLoop?.reason);

    const score = this.calculateScore(counts, diagnosisConfidence, rootCauseCount, repairPlans.length, verificationPassed, repairStatus);
    const grade = this.determineGrade(score);
    const status = this.determineStatus(score);
    const recommendation = this.buildRecommendation(score, counts, diagnoses, repairPlans.length, verificationPassed);

    context.health = {
      score,
      grade,
      status,
      recommendation,
      critical: counts.critical,
      error: counts.error,
      warning: counts.warning,
      info: counts.info,
      autoRepairAvailable: repairPlans.some((plan) => plan.steps.some((step) => step.automatic)),
      diagnosisConfidence,
    };
  }

  private countBySeverity(issues: readonly Issue[]): SeverityCounts {
    return issues.reduce(
      (acc, issue) => {
        switch (issue.severity.toLowerCase()) {
          case "critical":
            acc.critical += 1;
            break;
          case "error":
            acc.error += 1;
            break;
          case "warning":
            acc.warning += 1;
            break;
          default:
            acc.info += 1;
            break;
        }
        return acc;
      },
      { critical: 0, error: 0, warning: 0, info: 0 }
    );
  }

  private calculateScore(
    counts: SeverityCounts,
    diagnosisConfidence: number,
    rootCauseCount: number,
    repairPlanCount: number,
    verificationPassed: boolean,
    repairStatus: string
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

    if (repairStatus === "PARTIALLY_RESOLVED") {
      score -= 5;
    } else if (repairStatus === "FAILED" || repairStatus === "INEFFECTIVE") {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private buildRecommendation(
    score: number,
    counts: SeverityCounts,
    diagnoses: readonly Diagnosis[],
    repairPlanCount: number,
    verificationPassed: boolean
  ): string {
    if (score >= 90) {
      return "Excellent health. Keep the diagnosis, repair coverage, and verification status aligned.";
    }

    const pieces: string[] = [];

    if (counts.critical > 0 || counts.error > 0 || counts.warning > 0) {
      pieces.push("Resolve remaining critical and error issues first.");
    }

    if (diagnoses.length === 0) {
      pieces.push("Add diagnosis entries for detected issues.");
    }

    if (repairPlanCount === 0) {
      pieces.push("Create repair plans for identified root causes.");
    }

    if (!verificationPassed) {
      pieces.push("Verify the current repair and diagnosis results.");
    }

    if (pieces.length === 0) {
      return "Improve repair coverage and verification for a stronger health score.";
    }

    return pieces.join(" ");
  }

  private determineGrade(score: number): HealthGrade {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
  }

  private determineStatus(score: number): HealthStatus {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    if (score >= 60) return "Poor";
    return "Critical";
  }
}
