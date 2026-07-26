import type { Context } from "../core/Context.js";
import type { FixSuggestion } from "../core/FixSuggestion.js";
import type { Issue } from "../core/Issue.js";
import type { FixPlan } from "./FixPlan.js";

export interface FixResult {
  issueId: string;
  success: boolean;
  changedFiles: string[];
  rollbackFiles: string[];
  logs: string[];
  plans: FixPlan[];
}

export interface FixAllResult {
  success: boolean;
  changedFiles: string[];
  rollbackFiles: string[];
  logs: string[];
  results: FixResult[];
}

export class AutoFixEngine {
  public analyze(issue: Issue): FixPlan[] {
    if (!issue.fixes || issue.fixes.length === 0) {
      return [];
    }

    return issue.fixes.map((fix) => this.mapSuggestionToPlan(fix));
  }

  public canFix(issue: Issue): boolean {
    return Array.isArray(issue.fixes) && issue.fixes.length > 0;
  }

  public fix(issue: Issue, context: Context): FixResult {
    const plans = this.analyze(issue);
    const success = plans.length > 0;
    const logs: string[] = [];
    if (success) {
      logs.push(`Generated ${plans.length} fix plan(s) for issue ${issue.id}.`);
    } else {
      logs.push(`No fix plans available for issue ${issue.id}.`);
    }

    return {
      issueId: issue.id,
      success,
      changedFiles: [],
      rollbackFiles: [],
      logs,
      plans,
    };
  }

  public fixAll(context: Context): FixAllResult {
    const issues = context.getIssues();
    const results: FixResult[] = issues.map((issue) => this.fix(issue, context));
    const success = results.every((result) => result.success);
    const changedFiles = [...new Set(results.flatMap((result) => result.changedFiles))];
    const rollbackFiles = [...new Set(results.flatMap((result) => result.rollbackFiles))];
    const logs = results.flatMap((result) => result.logs);

    return {
      success,
      changedFiles,
      rollbackFiles,
      logs,
      results,
    };
  }

  private mapSuggestionToPlan(fixSuggestion: FixSuggestion): FixPlan {
    return {
      id: fixSuggestion.id,
      title: fixSuggestion.title,
      description: fixSuggestion.description,
      commands: this.buildCommands(fixSuggestion.steps),
      filesToModify: [],
      risk: fixSuggestion.risk,
      estimatedTime: this.estimateTime(fixSuggestion.risk),
      rollbackPlan: this.buildRollbackPlan(fixSuggestion.steps),
    };
  }

  private buildCommands(steps: string[]): string[] {
    return steps.map((step) => step.trim()).filter(Boolean);
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

  private buildRollbackPlan(steps: string[]): string[] {
    if (steps.length === 0) {
      return ["No rollback plan available."];
    }

    return steps.map((step) => `Undo: ${step}`);
  }
}
