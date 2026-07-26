import type { RepairPlan } from "../planner/RepairPlan.js";

export interface AutoFixResult {
  success: boolean;
  appliedSteps: string[];
  errors: string[];
  rollbackRequired: boolean;
}

export class AutoFix {
  public readonly plan: RepairPlan;
  public readonly createdAt: Date;

  constructor(plan: RepairPlan) {
    this.plan = plan;
    this.createdAt = new Date();
  }
}

export default AutoFix;
