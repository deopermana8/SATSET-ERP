import type { Context } from "../core/Context.js";
import type { Issue } from "../core/Issue.js";
import type { FixPlan } from "./FixPlan.js";

export type PatchType = "dependency" | "configuration" | "code" | "schema" | "build" | "misc";
export type PatchRisk = "low" | "medium" | "high";
export type PatchPriority = "critical" | "high" | "medium" | "low";

export interface PatchAction {
  type: PatchType;
  target: string;
  description: string;
  command?: string;
  reason?: string;
}

export interface PatchPlan {
  id: string;
  title: string;
  description: string;
  issueId: string;
  category: string;
  priority: PatchPriority;
  risk: PatchRisk;
  actions: PatchAction[];
  filesToModify: string[];
  dependsOn: string[];
  conflictsWith: string[];
  estimatedTime: string;
}

export class FixPlanner {
  public plan(context: Context): FixPlan {
    const patches = context.issues.flatMap((issue) => this.buildPatchPlans(issue));
    const uniquePatches = this.deduplicatePatches(patches);
    const orderedPatches = this.orderPatches(uniquePatches);
    const groupedByCategory = this.groupByCategory(orderedPatches);
    const dependencies = this.buildDependencies(orderedPatches);

    return {
      id: `fix-plan-${context.projectName.toLowerCase().replace(/\s+/g, "-")}`,
      title: `Fix plan for ${context.projectName}`,
      description: `Planned repairs for ${context.issues.length} issue(s)`,
      commands: orderedPatches.flatMap((patch) => patch.actions.map((action) => action.command).filter((command): command is string => Boolean(command))),
      filesToModify: Array.from(new Set(orderedPatches.flatMap((patch) => patch.filesToModify))),
      risk: this.determineRisk(orderedPatches),
      estimatedTime: this.determineEstimate(orderedPatches),
      rollbackPlan: [`Rollback ${orderedPatches.length} patch plan(s)`],
      patches: orderedPatches,
      groupedByCategory,
      dependencies,
      priority: this.determinePriority(orderedPatches),
    } as FixPlan;
  }

  private buildPatchPlans(issue: Issue): PatchPlan[] {
    const basePatch: PatchPlan = {
      id: `${issue.id}-main`,
      title: issue.title,
      description: issue.message,
      issueId: issue.id,
      category: issue.category,
      priority: this.priorityFromSeverity(issue.severity),
      risk: this.riskFromSeverity(issue.severity),
      actions: this.buildActions(issue),
      filesToModify: issue.file ? [issue.file] : [],
      dependsOn: [],
      conflictsWith: [],
      estimatedTime: this.estimateIssue(issue),
    };

    const patches: PatchPlan[] = [basePatch];

    if (typeof issue.suggestion === "string" && issue.suggestion.length > 0) {
      patches.push({
        ...basePatch,
        id: `${issue.id}-followup`,
        title: `${issue.title} follow-up`,
        description: issue.suggestion,
        priority: this.higherPriority(basePatch.priority, "medium"),
        risk: this.higherRisk(basePatch.risk, "medium"),
        actions: [
          {
            type: "configuration",
            target: issue.file ?? "project",
            description: issue.suggestion,
            command: issue.file ? `apply-fix ${issue.file}` : undefined,
          },
        ],
        filesToModify: issue.file ? [issue.file] : [],
      });
    }

    return patches;
  }

  private buildActions(issue: Issue): PatchAction[] {
    const actions: PatchAction[] = [];

    if (issue.category.toLowerCase().includes("prisma")) {
      actions.push({
        type: "schema",
        target: issue.file ?? "schema.prisma",
        description: "Validate Prisma schema and generated client",
        command: "prisma generate",
      });
    }

    if (issue.category.toLowerCase().includes("typescript")) {
      actions.push({
        type: "configuration",
        target: issue.file ?? "tsconfig.json",
        description: "Adjust TypeScript configuration",
        command: "tsc --noEmit",
      });
    }

    if (issue.category.toLowerCase().includes("dependency")) {
      actions.push({
        type: "dependency",
        target: issue.file ?? "package.json",
        description: "Sync dependency metadata",
        command: "pnpm install",
      });
    }

    if (actions.length === 0) {
      actions.push({
        type: "misc",
        target: issue.file ?? "project",
        description: issue.message,
      });
    }

    return actions;
  }

  private deduplicatePatches(patches: PatchPlan[]): PatchPlan[] {
    const seen = new Set<string>();
    return patches.filter((patch) => {
      const key = `${patch.issueId}:${patch.title}:${patch.actions.map((action) => action.target).join("|")}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private orderPatches(patches: PatchPlan[]): PatchPlan[] {
    return [...patches].sort((left, right) => {
      const leftWeight = this.priorityWeight(left.priority) + this.riskWeight(left.risk);
      const rightWeight = this.priorityWeight(right.priority) + this.riskWeight(right.risk);
      return rightWeight - leftWeight;
    });
  }

  private groupByCategory(patches: PatchPlan[]): Record<string, PatchPlan[]> {
    const grouped: Record<string, PatchPlan[]> = {};

    for (const patch of patches) {
      const category = patch.category || "general";
      grouped[category] ??= [];
      grouped[category].push(patch);
    }

    return grouped;
  }

  private buildDependencies(patches: PatchPlan[]): Array<{ from: string; to: string; reason: string }> {
    const dependencies: Array<{ from: string; to: string; reason: string }> = [];

    for (let index = 0; index < patches.length - 1; index += 1) {
      const current = patches[index];
      const next = patches[index + 1];
      if (current.category !== next.category) {
        dependencies.push({
          from: current.id,
          to: next.id,
          reason: "Preserve execution order between categories",
        });
      }
    }

    return dependencies;
  }

  private priorityFromSeverity(severity: string): PatchPriority {
    switch (severity.toLowerCase()) {
      case "critical":
        return "critical";
      case "error":
        return "high";
      case "warning":
        return "medium";
      default:
        return "low";
    }
  }

  private riskFromSeverity(severity: string): PatchRisk {
    switch (severity.toLowerCase()) {
      case "critical":
        return "high";
      case "error":
        return "high";
      case "warning":
        return "medium";
      default:
        return "low";
    }
  }

  private higherPriority(left: PatchPriority, right: PatchPriority): PatchPriority {
    const order: PatchPriority[] = ["low", "medium", "high", "critical"];
    return order[Math.max(order.indexOf(left), order.indexOf(right))] as PatchPriority;
  }

  private higherRisk(left: PatchRisk, right: PatchRisk): PatchRisk {
    const order: PatchRisk[] = ["low", "medium", "high"];
    return order[Math.max(order.indexOf(left), order.indexOf(right))] as PatchRisk;
  }

  private estimateIssue(issue: Issue): string {
    if (issue.severity.toLowerCase() === "critical") {
      return "20-40 min";
    }
    if (issue.severity.toLowerCase() === "error") {
      return "10-20 min";
    }
    return "5-10 min";
  }

  private determineRisk(patches: PatchPlan[]): PatchRisk {
    return patches.some((patch) => patch.risk === "high") ? "high" : patches.some((patch) => patch.risk === "medium") ? "medium" : "low";
  }

  private determinePriority(patches: PatchPlan[]): PatchPriority {
    return patches.some((patch) => patch.priority === "critical") ? "critical" : patches.some((patch) => patch.priority === "high") ? "high" : patches.some((patch) => patch.priority === "medium") ? "medium" : "low";
  }

  private determineEstimate(patches: PatchPlan[]): string {
    const total = patches.reduce((sum, patch) => sum + this.estimateMinutes(patch.estimatedTime), 0);
    if (total >= 40) {
      return "40-60 min";
    }
    if (total >= 20) {
      return "20-40 min";
    }
    return "10-20 min";
  }

  private estimateMinutes(value: string): number {
    const match = value.match(/(\d+)/);
    return match ? Number.parseInt(match[1], 10) : 5;
  }

  private priorityWeight(priority: PatchPriority): number {
    switch (priority) {
      case "critical":
        return 4;
      case "high":
        return 3;
      case "medium":
        return 2;
      default:
        return 1;
    }
  }

  private riskWeight(risk: PatchRisk): number {
    switch (risk) {
      case "high":
        return 3;
      case "medium":
        return 2;
      default:
        return 1;
    }
  }
}
