import type { Context } from "../../core/Context.js";
import type { Issue } from "../../core/Issue.js";
import type { FixPlan } from "../FixPlan.js";

interface PrismaFixResult {
  issueId: string;
  plans: FixPlan[];
  confidence: number;
}

const PRISMA_FIX_IDS = new Set([
  "prisma-generated-client-missing",
  "prisma-runtime-missing",
  "prisma-schema-missing",
  "prisma-generator-output-mismatch",
]);

export class PrismaFixer {
  public analyze(issue: Issue): FixPlan[] {
    if (!this.canFix(issue)) {
      return [];
    }

    return issue.fixes?.map((fixSuggestion) => this.mapSuggestionToPlan(fixSuggestion)) ?? [];
  }

  public canFix(issue: Issue): boolean {
    if (!issue || !Array.isArray(issue.fixes) || issue.fixes.length === 0) {
      return false;
    }

    return PRISMA_FIX_IDS.has(issue.id) || issue.fixes.some((fix) => PRISMA_FIX_IDS.has(fix.id));
  }

  public fix(issue: Issue, context: Context): PrismaFixResult {
    const plans = this.analyze(issue);
    const confidence = this.calculateConfidence(issue, plans);

    return {
      issueId: issue.id,
      plans,
      confidence,
    };
  }

  private mapSuggestionToPlan(fixSuggestion: { id: string; title: string; description: string; risk: "low" | "medium" | "high"; automatic: boolean; steps: string[] }): FixPlan {
    return {
      id: fixSuggestion.id,
      title: fixSuggestion.title,
      description: fixSuggestion.description,
      commands: fixSuggestion.steps.map((step) => step.trim()).filter(Boolean),
      filesToModify: [],
      risk: fixSuggestion.risk,
      estimatedTime: this.estimateTime(fixSuggestion.risk),
      rollbackPlan: fixSuggestion.steps.map((step) => `Undo: ${step}`),
    };
  }

  private calculateConfidence(issue: Issue, plans: FixPlan[]): number {
    if (plans.length === 0) {
      return 0;
    }

    const issueMatch = PRISMA_FIX_IDS.has(issue.id) ? 1 : 0.5;
    const planMatch = Math.min(1, plans.length / 2);
    return Number((Math.max(0.5, issueMatch + planMatch) / 2).toFixed(2));
  }

  private estimateTime(risk: "low" | "medium" | "high"): string {
    switch (risk) {
      case "low":
        return "5 minutes";
      case "medium":
        return "15 minutes";
      case "high":
        return "30 minutes";
      default:
        return "unknown";
    }
  }
}
