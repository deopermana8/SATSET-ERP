import type { RepairStep } from "./RepairStep.js";

export interface RepairPlan {
  id: string;
  rootCauseId: string;
  title: string;
  description: string;
  steps: RepairStep[];
  totalEstimatedTime: number;
  priority: number;
}
