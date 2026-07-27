import type { Context } from "../core/Context.js";
import type { Issue } from "../core/Issue.js";

export type RepairLifecycleStatus = "ALREADY_HEALTHY" | "RESOLVED" | "PARTIALLY_RESOLVED" | "INEFFECTIVE" | "FAILED" | "SKIPPED";

export interface RepairLifecycleState {
  beforeIssueIds: string[];
  afterIssueIds: string[];
  resolvedIssueIds: string[];
  remainingIssueIds: string[];
  failedIssueIds: string[];
  repairStatus: RepairLifecycleStatus;
  repairAttemptCount: number;
  actualRepairAction?: string;
  verificationPassed: boolean;
  verificationReasons: string[];
}

export function deriveRepairLifecycleState(params: {
  beforeIssues: readonly Issue[];
  afterIssues: readonly Issue[];
  repairAttempted?: boolean;
  repairExecutionSucceeded?: boolean;
  repairSkipped?: boolean;
  repairAttemptCount?: number;
  actualRepairAction?: string;
  failedIssueIds?: readonly string[];
}): RepairLifecycleState {
  const beforeIssueIds = uniqueIds(params.beforeIssues);
  const afterIssueIds = uniqueIds(params.afterIssues);
  const resolvedIssueIds = beforeIssueIds.filter((issueId) => !afterIssueIds.includes(issueId));
  const remainingIssueIds = afterIssueIds.filter((issueId) => beforeIssueIds.includes(issueId));
  const failedIssueIds = uniqueIds(params.failedIssueIds ?? []);

  let repairStatus: RepairLifecycleStatus;
  if (!params.repairAttempted) {
    repairStatus = beforeIssueIds.length === 0 ? "ALREADY_HEALTHY" : params.repairSkipped ? "SKIPPED" : "INEFFECTIVE";
  } else if (params.repairSkipped) {
    repairStatus = "SKIPPED";
  } else if (!params.repairExecutionSucceeded) {
    repairStatus = "FAILED";
  } else if (beforeIssueIds.length === 0) {
    repairStatus = "ALREADY_HEALTHY";
  } else if (afterIssueIds.length === 0) {
    repairStatus = "RESOLVED";
  } else if (resolvedIssueIds.length > 0 && remainingIssueIds.length > 0) {
    repairStatus = "PARTIALLY_RESOLVED";
  } else {
    repairStatus = "INEFFECTIVE";
  }

  return {
    beforeIssueIds,
    afterIssueIds,
    resolvedIssueIds,
    remainingIssueIds,
    failedIssueIds,
    repairStatus,
    repairAttemptCount: params.repairAttemptCount ?? 0,
    actualRepairAction: params.actualRepairAction,
    verificationPassed: repairStatus === "ALREADY_HEALTHY" || repairStatus === "RESOLVED",
    verificationReasons: repairStatus === "ALREADY_HEALTHY" || repairStatus === "RESOLVED" ? [] : [`Repair lifecycle status: ${repairStatus}`],
  };
}

export function normalizeRepairState(context: Pick<Context, "diagnosis" | "rootCauses" | "repairPlans" | "getIssues">): void {
  const activeIssues = context.getIssues();
  const activeIssueIds = new Set(activeIssues.map((issue) => issue.id));

  if (activeIssues.length === 0) {
    context.diagnosis = [];
    context.rootCauses = [];
    context.repairPlans = [];
    return;
  }

  context.diagnosis = (context.diagnosis ?? []).filter((entry) => activeIssueIds.has(entry.id));

  const activeRootCauses = (context.rootCauses ?? []).filter((rootCause) => {
    const evidenceIds = new Set(rootCause.evidence.map((issue) => issue.id));
    return Array.from(evidenceIds).some((issueId) => activeIssueIds.has(issueId));
  });

  const activeRootCauseIds = new Set(activeRootCauses.map((rootCause) => rootCause.id));
  context.rootCauses = activeRootCauses;
  context.repairPlans = (context.repairPlans ?? []).filter((plan) => activeRootCauseIds.has(plan.rootCauseId));
}

export function statusToLoopReason(status: RepairLifecycleStatus): string {
  switch (status) {
    case "ALREADY_HEALTHY":
      return "no-issues";
    case "RESOLVED":
      return "resolved";
    case "PARTIALLY_RESOLVED":
      return "partially-resolved";
    case "INEFFECTIVE":
      return "ineffective";
    case "FAILED":
      return "failed";
    case "SKIPPED":
      return "skipped";
    default:
      return "unknown";
  }
}

export function reasonToStatus(reason?: string): RepairLifecycleStatus {
  switch (reason) {
    case "ALREADY_HEALTHY":
      return "ALREADY_HEALTHY";
    case "RESOLVED":
      return "RESOLVED";
    case "PARTIALLY_RESOLVED":
      return "PARTIALLY_RESOLVED";
    case "INEFFECTIVE":
      return "INEFFECTIVE";
    case "FAILED":
      return "FAILED";
    case "SKIPPED":
      return "SKIPPED";
    case "no-issues":
      return "ALREADY_HEALTHY";
    case "resolved":
      return "RESOLVED";
    case "partially-resolved":
      return "PARTIALLY_RESOLVED";
    case "ineffective":
      return "INEFFECTIVE";
    case "failed":
      return "FAILED";
    case "skipped":
      return "SKIPPED";
    case "no-repair-needed":
      return "ALREADY_HEALTHY";
    case "no-change":
      return "ALREADY_HEALTHY";
    case "no-repair-plans":
      return "SKIPPED";
    default:
      return "INEFFECTIVE";
  }
}

function uniqueIds(values: readonly string[] | readonly Issue[] | undefined): string[] {
  const ids = (values ?? []).map((value) => (typeof value === "string" ? value : value.id));
  return Array.from(new Set(ids.filter(Boolean))) as string[];
}
