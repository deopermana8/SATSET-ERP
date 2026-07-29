import crypto from "node:crypto";
import type { Issue } from "./Issue.js";
import type { IssueSummary } from "./IssueSummary.js";
import type { ProjectMetadata } from "./ProjectMetadata.js";
import type { Diagnosis } from "../diagnostic/Diagnosis.js";
import type { RootCause } from "../rootcause/RootCause.js";
import type { RepairPlan } from "../planner/RepairPlan.js";
import type { HealthSummary } from "../health/HealthSummary.js";

export interface RepairOptions {
  dryRun?: boolean;
  maxSteps?: number;
}

export interface RepairLogEntry {
  id: string;
  planId?: string;
  rootCauseId?: string;
  stepId?: string;
  title: string;
  status: "applied" | "dry-run" | "skipped" | "failed";
  message: string;
  filePath?: string;
  timestamp: string;
  rollbackStatus?: "none" | "restored" | "failed";
  retryCount?: number;
}

export interface RepairLoopState {
  attempt: number;
  completed: boolean;
  reason?: string;
}

export interface ContextParams {
  projectRoot: string;
  projectName: string;
  nodeVersion: string;
  pnpmVersion: string;
  typescriptVersion: string;
  prismaVersion: string;
  nextVersion: string;
  issues: Issue[];
  recommendations: string[];
  metadata: ProjectMetadata;
  diagnosis?: Diagnosis[];
  rootCauses?: RootCause[];
  repairPlans?: RepairPlan[];
  repairOptions?: RepairOptions;
  repairLog?: RepairLogEntry[];
  repairLoop?: RepairLoopState;
  repairSummary?: {
    beforeIssueCount?: number;
    afterIssueCount?: number;
    beforeHealth?: number;
    afterHealth?: number;
    fixedIssueCount?: number;
    remainingIssueCount?: number;
    durationMs?: number;
    rollbackStatus?: "none" | "restored" | "failed";
    beforeIssueIds?: string[];
    afterIssueIds?: string[];
    resolvedIssueIds?: string[];
    remainingIssueIds?: string[];
    failedIssueIds?: string[];
    repairStatus?: string;
    repairAttemptCount?: number;
    actualRepairAction?: string;
    verificationPassed?: boolean;
    verificationReasons?: string[];
  };
  health?: HealthSummary | null;
  verification?: unknown;
}

export class Context {
  projectRoot: string;
  projectName: string;
  nodeVersion: string;
  pnpmVersion: string;
  typescriptVersion: string;
  prismaVersion: string;
  nextVersion: string;
  issues: Issue[];
  recommendations: string[];
  metadata: ProjectMetadata;
  diagnosis?: Diagnosis[];
  rootCauses?: RootCause[];
  repairPlans?: RepairPlan[];
  repairOptions?: RepairOptions;
  repairLog?: RepairLogEntry[];
  repairLoop?: RepairLoopState;
  repairSummary?: {
    beforeIssueCount?: number;
    afterIssueCount?: number;
    beforeHealth?: number;
    afterHealth?: number;
    fixedIssueCount?: number;
    remainingIssueCount?: number;
    durationMs?: number;
    rollbackStatus?: "none" | "restored" | "failed";
    beforeIssueIds?: string[];
    afterIssueIds?: string[];
    resolvedIssueIds?: string[];
    remainingIssueIds?: string[];
    failedIssueIds?: string[];
    repairStatus?: string;
    repairAttemptCount?: number;
    actualRepairAction?: string;
    verificationPassed?: boolean;
    verificationReasons?: string[];
  };
  health?: HealthSummary | null;
  verification?: unknown;

  constructor(params: ContextParams) {
    this.projectRoot = params.projectRoot;
    this.projectName = params.projectName;
    this.nodeVersion = params.nodeVersion;
    this.pnpmVersion = params.pnpmVersion;
    this.typescriptVersion = params.typescriptVersion;
    this.prismaVersion = params.prismaVersion;
    this.nextVersion = params.nextVersion;
    this.issues = params.issues;
    this.recommendations = params.recommendations;
    this.metadata = params.metadata;
    this.diagnosis = params.diagnosis;
    this.rootCauses = params.rootCauses;
    this.repairPlans = params.repairPlans;
    this.repairOptions = params.repairOptions;
    this.repairLog = params.repairLog ?? [];
    this.repairLoop = params.repairLoop;
    this.repairSummary = params.repairSummary;
    this.health = params.health ?? null;
    this.verification = params.verification;
  }

  addIssue(issue: Issue): void {
    const normalizedIssue = this.normalizeIssue(issue);
    const duplicate = this.issues.some(
      (existing) => existing.id === normalizedIssue.id && existing.message === normalizedIssue.message
    );

    if (!duplicate) {
      this.issues.push(normalizedIssue);
    }
  }

  getIssues(): readonly Issue[] {
    return [...this.issues].sort((left, right) => left.id.localeCompare(right.id));
  }

  private normalizeIssue(issue: Issue): Issue {
    const normalizedMessage = this.normalizeText(issue.message);
    const ruleId = this.normalizeText(issue.ruleId ?? issue.id);
    const file = this.normalizeText(issue.file ?? "unknown-file");
    const line = typeof issue.line === "number" ? String(issue.line) : "0";
    const hash = crypto.createHash("sha256").update(`${ruleId}|${file}|${line}|${normalizedMessage}`, "utf8").digest("hex").slice(0, 12);
    const deterministicId = `${ruleId}-${file}-${line}-${hash}`;

    return {
      ...issue,
      id: deterministicId,
      message: issue.message,
    };
  }

  private normalizeText(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\\+/g, "/")
      .replace(/[^a-z0-9./_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  getSummary(): IssueSummary {
    const summary: IssueSummary = {
      total: 0,
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
      byCategory: {},
      bySeverity: {},
    };

    for (const issue of this.issues) {
      summary.total += 1;

      const severity = issue.severity.toLowerCase();
      if (severity === "critical") {
        summary.critical += 1;
      } else if (severity === "error") {
        summary.error += 1;
      } else if (severity === "warning") {
        summary.warning += 1;
      } else if (severity === "info") {
        summary.info += 1;
      }

      summary.byCategory[issue.category] = (summary.byCategory[issue.category] ?? 0) + 1;
      summary.bySeverity[issue.severity] = (summary.bySeverity[issue.severity] ?? 0) + 1;
    }

    return summary;
  }
}
