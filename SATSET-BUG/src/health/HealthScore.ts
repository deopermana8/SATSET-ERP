import type { HealthGrade, HealthStatus, HealthSummary } from "./HealthSummary.js";
import type { Issue } from "../core/Issue.js";
import type { Diagnosis } from "../diagnostic/Diagnosis.js";

export class HealthScore {
  score: number;
  grade: HealthGrade;
  status: HealthStatus;
  critical: number;
  error: number;
  warning: number;
  info: number;
  autoRepairAvailable: boolean;
  diagnosisConfidence: number;

  constructor(summary: HealthSummary) {
    this.score = summary.score;
    this.grade = summary.grade;
    this.status = summary.status;
    this.critical = summary.critical;
    this.error = summary.error;
    this.warning = summary.warning;
    this.info = summary.info;
    this.autoRepairAvailable = summary.autoRepairAvailable;
    this.diagnosisConfidence = summary.diagnosisConfidence;
  }
}
