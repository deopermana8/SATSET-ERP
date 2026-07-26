import type { Context } from "../../core/Context.js";
import type { FixPlan } from "../FixPlan.js";
import type { Issue } from "../../core/Issue.js";

const ISSUE_PRIORITY: Record<string, number> = {
  "duplicate-package-dependencies": 1,
  "dependency-version-conflicts": 2,
  "unused-dependency-candidates": 3,
  "peer-dependency-mismatch": 4,
};

export class DependencyFixer {
  public canFix(issue: Issue): boolean {
    return Boolean(issue && ISSUE_PRIORITY[issue.id] !== undefined);
  }

  public analyze(issue: Issue, context: Context): FixPlan[] {
    if (!this.canFix(issue)) {
      return [];
    }

    const plans = this.buildPlans(issue, context);
    return plans.sort((left, right) => (ISSUE_PRIORITY[left.id] ?? 99) - (ISSUE_PRIORITY[right.id] ?? 99));
  }

  public fix(issue: Issue, context: Context): FixPlan[] {
    return this.analyze(issue, context);
  }

  private buildPlans(issue: Issue, context: Context): FixPlan[] {
    switch (issue.id) {
      case "duplicate-package-dependencies":
        return [this.createDuplicatePlan(issue)];
      case "dependency-version-conflicts":
        return [this.createVersionConflictPlan(issue)];
      case "unused-dependency-candidates":
        return [this.createUnusedPlan(issue)];
      case "peer-dependency-mismatch":
        return [this.createPeerPlan(issue)];
      default:
        return [];
    }
  }

  private createDuplicatePlan(issue: Issue): FixPlan {
    return {
      id: "dependency-duplicate-plan",
      title: "Consolidate duplicate dependency declarations",
      description: "Remove duplicate package declarations and keep a single authoritative dependency entry.",
      commands: [
        "Review manifest files for duplicate dependency declarations.",
        "Keep one dependency entry per package and remove the redundant definition.",
      ],
      filesToModify: ["package.json"],
      risk: "low",
      estimatedTime: "10 minutes",
      rollbackPlan: ["Restore the removed duplicate dependency entries from version control."],
    };
  }

  private createVersionConflictPlan(issue: Issue): FixPlan {
    return {
      id: "dependency-version-conflict-plan",
      title: "Align dependency versions",
      description: "Standardize dependency versions so the workspace uses a single compatible version.",
      commands: [
        "Compare version ranges reported in the issue.",
        "Update package manifests to use a consistent version across the workspace.",
      ],
      filesToModify: ["package.json"],
      risk: "medium",
      estimatedTime: "20 minutes",
      rollbackPlan: ["Revert manifest changes to restore the previous dependency versions."],
    };
  }

  private createUnusedPlan(issue: Issue): FixPlan {
    return {
      id: "dependency-unused-plan",
      title: "Remove or rehome unused dependencies",
      description: "Delete unused dependency entries or reassign them to the package that actually uses them.",
      commands: [
        "Inspect the unused dependency candidates.",
        "Remove unused entries or move them to the right workspace package.",
      ],
      filesToModify: ["package.json"],
      risk: "low",
      estimatedTime: "10 minutes",
      rollbackPlan: ["Restore the removed dependency entries from version control."],
    };
  }

  private createPeerPlan(issue: Issue): FixPlan {
    return {
      id: "dependency-peer-plan",
      title: "Resolve peer dependency conflicts",
      description: "Adjust peer dependency versions so they satisfy the workspace package requirements.",
      commands: [
        "Review peer dependency requirements for the affected packages.",
        "Update versions to a compatible range without installing anything.",
      ],
      filesToModify: ["package.json"],
      risk: "medium",
      estimatedTime: "15 minutes",
      rollbackPlan: ["Revert the peer dependency changes from version control."],
    };
  }
}
