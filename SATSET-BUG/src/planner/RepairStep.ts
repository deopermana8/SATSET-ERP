export type RepairRisk = "low" | "medium" | "high";

export interface RepairStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  automatic: boolean;
  risk: RepairRisk;
  dependsOn: string[];
}
