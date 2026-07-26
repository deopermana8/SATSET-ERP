import type { Context } from "../core/Context.js";
import type { Issue } from "../core/Issue.js";
import type { Diagnosis } from "./DiagnosisEngine.js";

export type HealthGrade = "A+" | "A" | "B" | "C" | "D" | "F";

export interface HealthScoreReport {
  score: number;
  grade: HealthGrade;
  recommendations: string[];
}

export class HealthScoreEngine {
  public evaluate(context: Context, diagnosis: Diagnosis, issues: readonly Issue[]): HealthScoreReport {
    const score = this.calculateScore(issues);
    const grade = this.determineGrade(score);
    const recommendations = this.buildRecommendations(context, diagnosis, issues);

    return {
      score,
      grade,
      recommendations,
    };
  }

  private calculateScore(issues: readonly Issue[]): number {
    let score = 100;

    for (const issue of issues) {
      const penalty = this.getPenalty(issue.severity);
      score -= penalty;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private determineGrade(score: number): HealthGrade {
    if (score >= 97) {
      return "A+";
    }
    if (score >= 90) {
      return "A";
    }
    if (score >= 80) {
      return "B";
    }
    if (score >= 70) {
      return "C";
    }
    if (score >= 60) {
      return "D";
    }
    return "F";
  }

  private buildRecommendations(context: Context, diagnosis: Diagnosis, issues: readonly Issue[]): string[] {
    const recommendations = new Set<string>();

    if (diagnosis.recommendedActions?.length) {
      for (const action of diagnosis.recommendedActions) {
        recommendations.add(action);
      }
    }

    for (const issue of issues) {
      if (issue.fixes?.length) {
        for (const fix of issue.fixes) {
          if (fix.title) {
            recommendations.add(fix.title);
          }
          if (fix.description) {
            recommendations.add(fix.description);
          }
        }
      }

      if (issue.message) {
        recommendations.add(issue.message);
      }
    }

    if (recommendations.size === 0) {
      recommendations.add("Inspect project configuration and resolve the reported issues.");
    }

    return [...recommendations];
  }

  private getPenalty(severity: string): number {
    switch (severity.toLowerCase()) {
      case "critical":
        return 25;
      case "error":
        return 12;
      case "warning":
        return 5;
      case "info":
        return 2;
      default:
        return 3;
    }
  }
}
