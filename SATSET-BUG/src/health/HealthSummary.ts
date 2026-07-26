export type HealthGrade = "A" | "B" | "C" | "D" | "E";
export type HealthStatus = "Excellent" | "Good" | "Fair" | "Poor" | "Critical";

export interface HealthSummary {
  score: number;
  grade: HealthGrade;
  status: HealthStatus;
  recommendation: string;
  critical: number;
  error: number;
  warning: number;
  info: number;
  autoRepairAvailable: boolean;
  diagnosisConfidence: number;
}
