import type { Context } from "../core/Context.js";
import type { Issue } from "../core/Issue.js";
import type { Diagnosis } from "./Diagnosis.js";
import { mapFixSuggestion } from "./Diagnosis.js";
import DiagnosisManager from "./DiagnosisManager.js";
import { Severity } from "../core/Severity.js";
import type { IEngine } from "../core/IEngine.js";

export class DiagnosticEngine implements IEngine {
  public readonly name = "DiagnosticEngine";
  private readonly manager: DiagnosisManager;

  constructor(manager?: DiagnosisManager) {
    this.manager = manager ?? new DiagnosisManager();
  }

  async run(context: Context): Promise<void> {
    const issues: readonly Issue[] = context.getIssues();
    const diagnoses: Diagnosis[] = issues.map((issue) => this.issueToDiagnosis(issue));
    this.manager.addMany(diagnoses);
    context.diagnosis = diagnoses;
  }

  private issueToDiagnosis(issue: Issue): Diagnosis {
    const confidence = this.mapSeverityToConfidence(issue.severity);
    const affectedFiles = issue.file ? [issue.file] : [];
    const recommendedFixes = (issue.fixes ?? []).map(mapFixSuggestion);
    const automaticFixAvailable = recommendedFixes.some((f) => f.automatic === true);

    const estimatedRepairTime = this.estimateRepairTime(recommendedFixes);

    return {
      id: issue.id,
      title: issue.title ?? issue.message ?? issue.id,
      rootCause: issue.category ?? issue.message ?? "unknown",
      confidence,
      description: issue.message ?? "",
      affectedFiles,
      recommendedFixes,
      estimatedRepairTime,
      automaticFixAvailable,
    };
  }

  private mapSeverityToConfidence(severity: Issue["severity"]) {
    switch (severity) {
      case Severity.Critical:
        return 90;
      case Severity.Error:
        return 80;
      case Severity.Warning:
        return 60;
      default:
        return 40;
    }
  }

  private estimateRepairTime(fixes: Diagnosis["recommendedFixes"]) : number | null {
    if (!fixes || fixes.length === 0) return null;
    // simple heuristic: low=30m, medium=120m, high=480m; sum and average
    const totals = fixes.map((f) => {
      if (f.risk === "low") return 30;
      if (f.risk === "medium") return 120;
      return 480;
    });
    const sum = totals.reduce((a, b) => a + b, 0);
    return Math.round(sum / totals.length);
  }
}

export default DiagnosticEngine;
