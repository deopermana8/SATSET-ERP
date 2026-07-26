import type { RepairPlan } from "../planner/RepairPlan.js";
import type { AutoFixResult } from "./AutoFix.js";

export interface IAutoFix {
  id: string;
  name: string;
  description: string;
  supports(plan: RepairPlan): boolean;
  execute(plan: RepairPlan): Promise<AutoFixResult>;
}
