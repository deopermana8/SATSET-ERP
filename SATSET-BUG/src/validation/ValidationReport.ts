export interface ValidationReportSummary {
  compileSuccess: boolean;
  testSuccess: boolean;
  repairSuccess: boolean;
  benchmarkScore: number;
  releaseStatus: string;
  executionDurationMs: number;
  artifactsGenerated: string[];
}

export class ValidationReport {
  static fromPayload(payload: ValidationReportSummary): ValidationReportSummary {
    return payload;
  }
}
