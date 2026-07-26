import type { FixPlan } from "./FixPlan.js";
import type { PatchPlan as PlannerPatchPlan } from "./FixPlanner.js";

export interface PatchDependency {
  from: string;
  to: string;
  reason: string;
}

export interface PatchConflict {
  from: string;
  to: string;
  reason: string;
}

export interface PatchEstimate {
  durationMs: number;
  rollbackCost: number;
  confidence: number;
}

export interface PatchBundle {
  id: string;
  adapter: string;
  patches: Array<PlannerPatchPlan & {
    adapter: string;
    dependencyIds: string[];
    conflictIds: string[];
    estimate: PatchEstimate;
  }>;
  dependencies: PatchDependency[];
  conflicts: PatchConflict[];
  estimate: PatchEstimate;
}

export class AutoPatchBuilder {
  public build(plan: FixPlan): PlannerPatchPlan[] {
    const sourcePlans = this.normalizeSourcePlans(plan);
    const mergedPlans = this.mergeDuplicates(sourcePlans);
    const ownedPlans = mergedPlans.map((patch) => this.resolveAdapterOwnership(patch));
    const bundles = this.createBundles(ownedPlans, plan);
    const validated = this.validateDependencies(bundles);
    const conflicted = this.detectConflicts(validated);

    return conflicted.flatMap((bundle) => bundle.patches);
  }

  public async buildAsync(plan: FixPlan): Promise<PlannerPatchPlan[]> {
    return this.build(plan);
  }

  private normalizeSourcePlans(plan: FixPlan): PlannerPatchPlan[] {
    if (Array.isArray(plan.patches) && plan.patches.length > 0) {
      return plan.patches;
    }

    return [
      {
        id: `${plan.id}-fallback`,
        title: plan.title,
        description: plan.description,
        issueId: plan.id,
        category: "general",
        priority: "medium",
        risk: plan.risk,
        actions: [
          {
            type: "misc",
            target: plan.filesToModify[0] ?? "project",
            description: plan.description,
          },
        ],
        filesToModify: plan.filesToModify,
        dependsOn: [],
        conflictsWith: [],
        estimatedTime: plan.estimatedTime,
      },
    ];
  }

  private mergeDuplicates(patches: PlannerPatchPlan[]): PlannerPatchPlan[] {
    const seen = new Set<string>();
    const merged: PlannerPatchPlan[] = [];

    for (const patch of patches) {
      const key = `${patch.issueId}:${patch.title}:${patch.actions.map((action) => action.target).join("|")}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push(patch);
    }

    return merged;
  }

  private resolveAdapterOwnership(patch: PlannerPatchPlan): PlannerPatchPlan & {
    adapter: string;
    dependencyIds: string[];
    conflictIds: string[];
    estimate: PatchEstimate;
  } {
    const adapter = this.resolveAdapter(patch);
    const estimate = this.estimatePatch(patch);
    const dependencyIds = patch.dependsOn ?? [];
    const conflictIds = patch.conflictsWith ?? [];

    return {
      ...patch,
      adapter,
      dependencyIds,
      conflictIds,
      estimate,
    };
  }

  private createBundles(
    patches: Array<PlannerPatchPlan & { adapter: string; dependencyIds: string[]; conflictIds: string[]; estimate: PatchEstimate }>,
    plan: FixPlan,
  ): PatchBundle[] {
    const bundles: PatchBundle[] = [];

    for (const patch of patches) {
      bundles.push({
        id: patch.id,
        adapter: patch.adapter,
        patches: [patch],
        dependencies: (patch.dependencyIds ?? []).map((dependencyId) => ({
          from: patch.id,
          to: dependencyId,
          reason: "Preserve execution order",
        })),
        conflicts: (patch.conflictIds ?? []).map((conflictId) => ({
          from: patch.id,
          to: conflictId,
          reason: "Conflicting patch target",
        })),
        estimate: patch.estimate,
      });
    }

    if (plan.dependencies && plan.dependencies.length > 0) {
      const dependencyBundles = plan.dependencies.map((dependency) => ({
        id: `${dependency.from}-${dependency.to}`,
        adapter: "dependency-graph",
        patches: [],
        dependencies: [{ from: dependency.from, to: dependency.to, reason: dependency.reason }],
        conflicts: [],
        estimate: { durationMs: 0, rollbackCost: 0, confidence: 1 },
      }));
      bundles.push(...dependencyBundles);
    }

    return bundles;
  }

  private validateDependencies(bundles: PatchBundle[]): PatchBundle[] {
    return bundles.filter((bundle) => {
      const invalid = bundle.dependencies.some((dependency) => dependency.from === dependency.to);
      return !invalid;
    });
  }

  private detectConflicts(bundles: PatchBundle[]): PatchBundle[] {
    const byId = new Map(bundles.map((bundle) => [bundle.id, bundle]));

    for (const bundle of bundles) {
      for (const conflict of bundle.conflicts) {
        const target = byId.get(conflict.to);
        if (target) {
          target.conflicts.push({ from: bundle.id, to: target.id, reason: conflict.reason });
        }
      }
    }

    return bundles;
  }

  private resolveAdapter(patch: PlannerPatchPlan): string {
    const category = patch.category.toLowerCase();
    if (category.includes("prisma")) {
      return "PrismaAdapter";
    }
    if (category.includes("typescript")) {
      return "TypeScriptAdapter";
    }
    if (category.includes("turbo")) {
      return "TurboAdapter";
    }
    if (category.includes("react")) {
      return "ReactAdapter";
    }
    if (patch.actions.some((action) => action.target.includes("package.json"))) {
      return "PackageJsonAdapter";
    }
    return "GenericAdapter";
  }

  private estimatePatch(patch: PlannerPatchPlan): PatchEstimate {
    const durationMs = this.parseMinutes(patch.estimatedTime) * 60_000;
    const rollbackCost = patch.risk === "high" ? 20_000 : patch.risk === "medium" ? 10_000 : 5_000;
    const confidence = patch.priority === "critical" ? 0.9 : patch.priority === "high" ? 0.8 : patch.priority === "medium" ? 0.7 : 0.6;

    return {
      durationMs,
      rollbackCost,
      confidence,
    };
  }

  private parseMinutes(value: string): number {
    const match = value.match(/(\d+)/);
    return match ? Number.parseInt(match[1], 10) : 5;
  }
}
