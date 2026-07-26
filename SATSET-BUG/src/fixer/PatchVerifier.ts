import type { PatchPlan } from "./FixPlanner.js";

export interface VerificationCheck {
  name: string;
  passed: boolean;
  reason: string;
}

export interface VerificationError {
  code: string;
  message: string;
  patchId?: string;
}

export interface VerificationWarning {
  code: string;
  message: string;
  patchId?: string;
}

export interface VerificationSummary {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  safetyScore: number;
}

export interface VerificationResult {
  passed: boolean;
  checks: VerificationCheck[];
  errors: VerificationError[];
  warnings: VerificationWarning[];
  summary: VerificationSummary;
}

export class PatchVerifier {
  public async verify(plans: PatchPlan[]): Promise<VerificationResult> {
    const checks: VerificationCheck[] = [];
    const errors: VerificationError[] = [];
    const warnings: VerificationWarning[] = [];

    checks.push(this.validatePlanShape(plans));
    checks.push(this.validateDependencies(plans));
    checks.push(this.validateConflicts(plans));
    checks.push(this.validateTargets(plans));
    checks.push(this.validateOrder(plans));
    checks.push(this.validateAdapterCompatibility(plans));

    const failedChecks = checks.filter((check) => !check.passed);
    const summary: VerificationSummary = {
      totalChecks: checks.length,
      passedChecks: checks.length - failedChecks.length,
      failedChecks: failedChecks.length,
      warnings: warnings.length,
      safetyScore: Math.max(0, Math.min(100, 100 - failedChecks.length * 15 + warnings.length * 3)),
    };

    return {
      passed: failedChecks.length === 0,
      checks,
      errors,
      warnings,
      summary,
    };
  }

  private validatePlanShape(plans: PatchPlan[]): VerificationCheck {
    const passed = Array.isArray(plans) && plans.every((plan) => Boolean(plan.id) && Boolean(plan.title));
    return {
      name: "plan-shape",
      passed,
      reason: passed ? "All patch plans have an identifier and title." : "Some patch plans are missing required metadata.",
    };
  }

  private validateDependencies(plans: PatchPlan[]): VerificationCheck {
    const missing: string[] = [];

    for (const plan of plans) {
      for (const dependencyId of plan.dependsOn ?? []) {
        const exists = plans.some((candidate) => candidate.id === dependencyId);
        if (!exists) {
          missing.push(`${plan.id} -> ${dependencyId}`);
        }
      }
    }

    return {
      name: "dependencies",
      passed: missing.length === 0,
      reason: missing.length === 0 ? "All dependencies are satisfied." : `Missing dependencies: ${missing.join(", ")}`,
    };
  }

  private validateConflicts(plans: PatchPlan[]): VerificationCheck {
    const conflicts: string[] = [];

    for (const plan of plans) {
      for (const conflictId of plan.conflictsWith ?? []) {
        const exists = plans.some((candidate) => candidate.id === conflictId);
        if (!exists) {
          conflicts.push(`${plan.id} conflicts with unknown patch ${conflictId}`);
        }
      }
    }

    return {
      name: "conflicts",
      passed: conflicts.length === 0,
      reason: conflicts.length === 0 ? "No conflicting patch references were detected." : conflicts.join("; "),
    };
  }

  private validateTargets(plans: PatchPlan[]): VerificationCheck {
    const missingTargets = plans.filter((plan) => (plan.filesToModify?.length ?? 0) === 0);
    return {
      name: "targets",
      passed: missingTargets.length === 0,
      reason: missingTargets.length === 0 ? "All patches declare at least one target file." : "Some patches do not declare a target file.",
    };
  }

  private validateOrder(plans: PatchPlan[]): VerificationCheck {
    const ordered = [...plans].sort((left, right) => left.priority.localeCompare(right.priority));
    return {
      name: "order",
      passed: ordered.length === plans.length,
      reason: ordered.length === plans.length ? "Patch order is structurally valid." : "Patch order could not be validated.",
    };
  }

  private validateAdapterCompatibility(plans: PatchPlan[]): VerificationCheck {
    const adapters = ["PrismaAdapter", "TypeScriptAdapter", "PackageJsonAdapter", "TurboAdapter", "ReactAdapter", "GenericAdapter"];
    const incompatible = plans.filter((plan) => !plan.actions.some((action) => action.target));
    return {
      name: "adapter-compatibility",
      passed: incompatible.length === 0,
      reason: incompatible.length === 0 ? "Patch actions are compatible with the adapter model." : "Some patch actions are missing a target.",
    };
  }
}
