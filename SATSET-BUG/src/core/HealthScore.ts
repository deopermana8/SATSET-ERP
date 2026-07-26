import type { Context } from "./Context.js";
import type { Issue } from "./Issue.js";

export interface HealthReport {
  score: number;
  grade: "A" | "B" | "C" | "D" | "E" | "F";
  critical: number;
  error: number;
  warning: number;
  info: number;
  recommendations: string[];
}

export class HealthScoreCalculator {
  public calculate(context: Context): HealthReport {
    const issues = context.getIssues();
    const counts = this.countBySeverity(issues);
    const score = this.calculateScore(counts);
    const grade = this.determineGrade(score);

    return {
      score,
      grade,
      critical: counts.critical,
      error: counts.error,
      warning: counts.warning,
      info: counts.info,
      recommendations: this.buildRecommendations(issues),
    };
  }

  private countBySeverity(issues: readonly Issue[]): Record<string, number> {
    return issues.reduce(
      (acc, issue) => {
        const severity = issue.severity.toLowerCase();
        if (severity === "critical") {
          acc.critical += 1;
        } else if (severity === "error") {
          acc.error += 1;
        } else if (severity === "warning") {
          acc.warning += 1;
        } else if (severity === "info") {
          acc.info += 1;
        }
        return acc;
      },
      { critical: 0, error: 0, warning: 0, info: 0 }
    );
  }

  private calculateScore(counts: Record<string, number>): number {
    const rawScore =
      100 - counts.critical * 20 - counts.error * 10 - counts.warning * 3 - counts.info * 1;
    return Math.max(0, Math.min(100, rawScore));
  }

  private determineGrade(score: number): HealthReport["grade"] {
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
    if (score >= 50) {
      return "E";
    }
    return "F";
  }

  private buildRecommendations(issues: readonly Issue[]): string[] {
    const recommendations = new Set<string>();

    for (const issue of issues) {
      if (typeof issue.suggestion === "object" && issue.suggestion !== null) {
        if (issue.suggestion.description) {
          recommendations.add(issue.suggestion.description);
        } else if (issue.suggestion.title) {
          recommendations.add(issue.suggestion.title);
        } else {
          recommendations.add(issue.message);
        }
      } else {
        recommendations.add(issue.message);
      }
    }

    return [...recommendations];
  }
}
