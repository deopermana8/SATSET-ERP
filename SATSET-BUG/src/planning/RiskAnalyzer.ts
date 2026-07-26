export interface RiskFinding {
  id: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export class RiskAnalyzer {
  analyze(): RiskFinding[] {
    return [
      { id: "risk-1", description: "Dependencies may be missing", severity: "medium" },
      { id: "risk-2", description: "Validation may be incomplete", severity: "high" },
    ];
  }
}
