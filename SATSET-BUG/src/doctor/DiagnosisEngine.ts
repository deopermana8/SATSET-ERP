import type { Context } from "../core/Context.js";
import type { Issue } from "../core/Issue.js";

export interface Diagnosis {
  rootCause: string;
  confidence: number;
  affectedModules: string[];
  recommendedActions: string[];
  estimatedRepairDifficulty: "low" | "medium" | "high";
  estimatedRepairTime: string;
}

export class DiagnosisEngine {
  public diagnose(context: Context): Diagnosis {
    const issues = context.getIssues();
    const metadata = context.metadata as Record<string, unknown>;
    const categories = this.getCategories(issues);
    const topCategory = this.getTopCategory(categories);
    const rootCause = this.inferRootCause(topCategory, metadata, issues);
    const confidence = this.calculateConfidence(issues, metadata, rootCause);
    const affectedModules = this.getAffectedModules(categories);
    const recommendedActions = this.generateRecommendedActions(issues, metadata);
    const estimatedRepairDifficulty = this.estimateRepairDifficulty(issues);
    const estimatedRepairTime = this.estimateRepairTime(estimatedRepairDifficulty, issues.length);

    return {
      rootCause,
      confidence,
      affectedModules,
      recommendedActions,
      estimatedRepairDifficulty,
      estimatedRepairTime,
    };
  }

  private getCategories(issues: readonly Issue[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const issue of issues) {
      const category = issue.category || "unknown";
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    return counts;
  }

  private getTopCategory(categories: Map<string, number>): string {
    let topCategory = "unknown";
    let topCount = 0;
    for (const [category, count] of categories.entries()) {
      if (count > topCount) {
        topCategory = category;
        topCount = count;
      }
    }
    return topCategory;
  }

  private inferRootCause(topCategory: string, metadata: Record<string, unknown>, issues: readonly Issue[]): string {
    if (issues.length === 0) {
      return this.inferRootCauseFromMetadata(metadata);
    }

    if (topCategory && topCategory !== "unknown") {
      return `${topCategory} issues`;
    }

    return this.inferRootCauseFromMetadata(metadata);
  }

  private inferRootCauseFromMetadata(metadata: Record<string, unknown>): string {
    if (metadata.prisma) {
      return "Prisma metadata";
    }
    if (metadata.next) {
      return "Next.js configuration";
    }
    if (metadata.typescript) {
      return "TypeScript configuration";
    }
    if (metadata.tailwind) {
      return "Tailwind configuration";
    }
    if (metadata.pnpm) {
      return "pnpm workspace setup";
    }
    return "project configuration";
  }

  private calculateConfidence(issues: readonly Issue[], metadata: Record<string, unknown>, rootCause: string): number {
    if (issues.length === 0) {
      return metadata && rootCause !== "project configuration" ? 50 : 20;
    }

    const severityWeight = issues.reduce((score, issue) => score + this.getSeverityWeight(issue.severity), 0);
    const base = Math.max(20, 100 - severityWeight);
    const adjustment = Math.min(30, issues.length * 2);
    return Math.max(0, Math.min(100, base + adjustment));
  }

  private getSeverityWeight(severity: string): number {
    switch (severity.toLowerCase()) {
      case "critical":
        return 20;
      case "error":
        return 10;
      case "warning":
        return 4;
      case "info":
        return 1;
      default:
        return 2;
    }
  }

  private getAffectedModules(categories: Map<string, number>): string[] {
    return [...categories.keys()].filter((category) => category !== "unknown");
  }

  private generateRecommendedActions(issues: readonly Issue[], metadata: Record<string, unknown>): string[] {
    const actions = new Set<string>();

    for (const issue of issues) {
      if (typeof issue.suggestion === "object" && issue.suggestion !== null) {
        if (issue.suggestion.title) {
          actions.add(issue.suggestion.title);
        }
        if (issue.suggestion.description) {
          actions.add(issue.suggestion.description);
        }
      }
    }

    if (actions.size === 0) {
      if (metadata.next) {
        actions.add("Review Next.js configuration and runtime settings.");
      }
      if (metadata.typescript) {
        actions.add("Validate TypeScript compiler settings and references.");
      }
      if (metadata.prisma) {
        actions.add("Check Prisma schema and generated client integrity.");
      }
      if (actions.size === 0) {
        actions.add("Inspect reported issues and project metadata for the most likely fix.");
      }
    }

    return [...actions];
  }

  private estimateRepairDifficulty(issues: readonly Issue[]): "low" | "medium" | "high" {
    const hasCritical = issues.some((issue) => issue.severity.toLowerCase() === "critical");
    const errorCount = issues.filter((issue) => issue.severity.toLowerCase() === "error").length;

    if (hasCritical || errorCount >= 5) {
      return "high";
    }
    if (errorCount >= 2 || issues.length >= 5) {
      return "medium";
    }
    return "low";
  }

  private estimateRepairTime(difficulty: "low" | "medium" | "high", issueCount: number): string {
    if (difficulty === "high") {
      return issueCount > 10 ? "1-2 days" : "4-8 hours";
    }
    if (difficulty === "medium") {
      return issueCount > 5 ? "4-8 hours" : "2-4 hours";
    }
    return issueCount > 3 ? "1-2 hours" : "30-60 minutes";
  }
}
