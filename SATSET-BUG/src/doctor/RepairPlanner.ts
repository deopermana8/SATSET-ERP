import type { Diagnosis } from "./DiagnosisEngine.js";
import type { Issue } from "../core/Issue.js";

export interface RepairStep {
  category: string;
  title: string;
  description: string;
  severity: string;
}

export interface RepairPlan {
  orderedSteps: RepairStep[];
  estimatedRepairTime: string;
  requiredRestart: boolean;
  requiredInstall: boolean;
  requiredBuild: boolean;
  groupedByCategory: Record<string, RepairStep[]>;
}

export class RepairPlanner {
  public plan(issues: readonly Issue[], diagnosis: Diagnosis): RepairPlan {
    const grouped = this.groupByCategory(issues);
    const orderedSteps = this.orderSteps(grouped, diagnosis);

    return {
      orderedSteps,
      estimatedRepairTime: this.estimateTime(issues, diagnosis),
      requiredRestart: this.requiresRestart(issues),
      requiredInstall: this.requiresInstall(issues),
      requiredBuild: this.requiresBuild(issues),
      groupedByCategory: grouped,
    };
  }

  private groupByCategory(issues: readonly Issue[]): Record<string, RepairStep[]> {
    const groups: Record<string, RepairStep[]> = {};

    for (const issue of issues) {
      const category = issue.category || "general";
      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push({
        category,
        title: issue.title,
        description: issue.message,
        severity: issue.severity,
      });
    }

    return groups;
  }

  private orderSteps(groups: Record<string, RepairStep[]>, diagnosis: Diagnosis): RepairStep[] {
    const ordered: RepairStep[] = [];
    const priority = this.getPriorityOrder(groups, diagnosis);

    for (const category of priority) {
      for (const step of groups[category] ?? []) {
        ordered.push(step);
      }
    }

    return ordered;
  }

  private getPriorityOrder(groups: Record<string, RepairStep[]>, diagnosis: Diagnosis): string[] {
    const categories = Object.keys(groups);
    const priority = [...categories].sort((left, right) => {
      const leftScore = this.categoryScore(left, diagnosis);
      const rightScore = this.categoryScore(right, diagnosis);
      return rightScore - leftScore;
    });

    return priority;
  }

  private categoryScore(category: string, diagnosis: Diagnosis): number {
    const lower = category.toLowerCase();
    if (lower.includes("prisma")) {
      return 100;
    }
    if (lower.includes("typescript")) {
      return 90;
    }
    if (lower.includes("next") || lower.includes("turbo")) {
      return 80;
    }
    if (lower.includes("dependency")) {
      return 70;
    }
    if (diagnosis.affectedModules.includes(category)) {
      return 60;
    }
    return 50;
  }

  private estimateTime(issues: readonly Issue[], diagnosis: Diagnosis): string {
    const count = issues.length;
    const severityBoost = issues.some((issue) => issue.severity.toLowerCase() === "critical") ? 1 : 0;
    if (diagnosis.estimatedRepairDifficulty === "high" || count > 8 || severityBoost) {
      return "4-8 hours";
    }
    if (diagnosis.estimatedRepairDifficulty === "medium" || count > 4) {
      return "2-4 hours";
    }
    return "30-60 minutes";
  }

  private requiresRestart(issues: readonly Issue[]): boolean {
    return issues.some((issue) => issue.category.toLowerCase().includes("next") || issue.category.toLowerCase().includes("prisma"));
  }

  private requiresInstall(issues: readonly Issue[]): boolean {
    return issues.some((issue) => issue.message.toLowerCase().includes("install") || issue.message.toLowerCase().includes("dependency"));
  }

  private requiresBuild(issues: readonly Issue[]): boolean {
    return issues.some((issue) => issue.category.toLowerCase().includes("typescript") || issue.category.toLowerCase().includes("prisma"));
  }
}
