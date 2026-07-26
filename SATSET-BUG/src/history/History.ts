import type { ProjectFingerprint } from "./ProjectFingerprint.js";
import type { HealthSummary } from "../health/HealthSummary.js";
import type { Issue } from "../core/Issue.js";
import type { Diagnosis } from "../diagnostic/Diagnosis.js";
import type { RootCause } from "../rootcause/RootCause.js";
import type { RepairPlan } from "../planner/RepairPlan.js";
import type { ProjectMetadata } from "../core/ProjectMetadata.js";
import type { RepairLogEntry } from "../core/Context.js";

export interface HistoryRecord {
  scanId: string;
  projectName: string;
  fingerprint: ProjectFingerprint;
  timestamp: string;
  durationMs: number;
  doctorVersion: string;
  health: HealthSummary | null;
  issues: Issue[];
  diagnosis?: Diagnosis[];
  rootCauses?: RootCause[];
  repairPlans?: RepairPlan[];
  repairLog?: RepairLogEntry[];
  repairLoop?: {
    attempt: number;
    completed: boolean;
    reason?: string;
  };
  repairSummary?: {
    beforeIssueCount?: number;
    afterIssueCount?: number;
    beforeHealth?: number;
    afterHealth?: number;
    fixedIssueCount?: number;
    remainingIssueCount?: number;
    durationMs?: number;
    rollbackStatus?: "none" | "restored" | "failed";
  };
  verification?: unknown;
  metadata: ProjectMetadata;
}

export interface HistoryComparison {
  scanA: string;
  scanB: string;
  sameFingerprint: boolean;
  differences: Record<string, { a: unknown; b: unknown }>;
  newIssues: Issue[];
  fixedIssues: Issue[];
  unchangedIssues: Issue[];
  healthDelta: number;
  scoreDelta: number;
  severityDelta: number;
}
