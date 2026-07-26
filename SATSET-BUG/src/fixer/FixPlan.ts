import type { PatchPlan, PatchPriority, PatchRisk } from "./FixPlanner.js";

export interface FixPlan {
  id: string;
  title: string;
  description: string;
  commands: string[];
  filesToModify: string[];
  risk: PatchRisk;
  estimatedTime: string;
  rollbackPlan: string[];
  patches?: PatchPlan[];
  groupedByCategory?: Record<string, PatchPlan[]>;
  dependencies?: Array<{ from: string; to: string; reason: string }>;
  priority?: PatchPriority;
}
