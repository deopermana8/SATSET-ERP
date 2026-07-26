import type { FixPlan } from "./FixPlan.js";
import { RollbackManager, type BackupRecord } from "./RollbackManager.js";

export type ExecutionStatus = "pending" | "running" | "succeeded" | "failed" | "rolled_back" | "skipped";
export type ExecutionStage = "backup" | "apply" | "verify" | "rollback" | "finish";

export interface ExecutionLog {
  id: string;
  timestamp: string;
  stage: ExecutionStage;
  status: ExecutionStatus;
  message: string;
  planId?: string;
  durationMs?: number;
}

export interface ExecutionSession {
  id: string;
  startedAt: string;
  finishedAt?: string;
  status: ExecutionStatus;
  planIds: string[];
  backupIds: Record<string, string>;
  durationMs?: number;
}

export interface ExecutionResult {
  success: boolean;
  status: ExecutionStatus;
  session: ExecutionSession;
  logs: ExecutionLog[];
  errors: string[];
  durationMs: number;
}

export interface ExecutionAdapter {
  backup?(plan: FixPlan): Promise<string | undefined>;
  apply?(plan: FixPlan): Promise<boolean | void>;
  verify?(plan: FixPlan): Promise<boolean | void>;
  rollback?(plan: FixPlan, backupId?: string): Promise<boolean | void>;
}

export class ExecutionEngine {
  constructor(
    private readonly adapter: ExecutionAdapter,
    private readonly rollbackManager: RollbackManager = new RollbackManager(),
  ) {}

  public async execute(plans: FixPlan[]): Promise<ExecutionResult> {
    const sessionId = `execution-${Date.now()}`;
    const session: ExecutionSession = {
      id: sessionId,
      startedAt: new Date().toISOString(),
      status: "running",
      planIds: plans.map((plan) => plan.id),
      backupIds: {},
    };

    const rollbackSession = this.rollbackManager.createSession(sessionId);
    const logs: ExecutionLog[] = [];
    const errors: string[] = [];
    const startedAt = Date.now();

    const pushLog = (
      stage: ExecutionStage,
      status: ExecutionStatus,
      message: string,
      planId?: string,
      durationMs?: number,
    ): void => {
      logs.push({
        id: `${stage}-${logs.length + 1}`,
        timestamp: new Date().toISOString(),
        stage,
        status,
        message,
        planId,
        durationMs,
      });
    };

    try {
      for (const plan of plans) {
        const planStartedAt = Date.now();
        let backupId: string | undefined;

        try {
          if (this.adapter.backup) {
            pushLog("backup", "running", `Backing up ${plan.title}`, plan.id);
            const backupResult = await this.adapter.backup(plan);
            backupId = backupResult;
            if (backupResult) {
              session.backupIds[plan.id] = backupResult;
              const backupRecord: BackupRecord = {
                id: backupResult,
                path: plan.filesToModify[0] ?? plan.id,
                createdAt: new Date().toISOString(),
                metadata: { planId: plan.id, title: plan.title },
              };
              this.rollbackManager.registerBackup(backupRecord);
              rollbackSession.backups.push(backupRecord);
              pushLog("backup", "succeeded", `Backup created for ${plan.id}`, plan.id, Date.now() - planStartedAt);
            } else {
              pushLog("backup", "skipped", `Backup skipped for ${plan.id}`, plan.id, Date.now() - planStartedAt);
            }
          } else {
            pushLog("backup", "skipped", `No backup adapter configured for ${plan.id}`, plan.id, Date.now() - planStartedAt);
          }

          if (this.adapter.apply) {
            pushLog("apply", "running", `Applying ${plan.title}`, plan.id);
            const applied = await this.adapter.apply(plan);
            if (applied === false) {
              throw new Error(`Apply phase failed for ${plan.id}`);
            }
            pushLog("apply", "succeeded", `Applied ${plan.id}`, plan.id, Date.now() - planStartedAt);
          } else {
            pushLog("apply", "skipped", `No apply adapter configured for ${plan.id}`, plan.id, Date.now() - planStartedAt);
          }

          if (this.adapter.verify) {
            pushLog("verify", "running", `Verifying ${plan.title}`, plan.id);
            const verified = await this.adapter.verify(plan);
            if (verified === false) {
              throw new Error(`Verify phase failed for ${plan.id}`);
            }
            pushLog("verify", "succeeded", `Verified ${plan.id}`, plan.id, Date.now() - planStartedAt);
          } else {
            pushLog("verify", "skipped", `No verify adapter configured for ${plan.id}`, plan.id, Date.now() - planStartedAt);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(message);
          pushLog("rollback", "running", `Rolling back ${plan.id} after failure`, plan.id, Date.now() - planStartedAt);

          if (this.adapter.rollback) {
            try {
              const rolledBack = await this.adapter.rollback(plan, backupId);
              if (rolledBack === false) {
                throw new Error(`Rollback phase failed for ${plan.id}`);
              }
              pushLog("rollback", "succeeded", `Rolled back ${plan.id}`, plan.id, Date.now() - planStartedAt);
            } catch (rollbackError) {
              const rollbackMessage = rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
              errors.push(rollbackMessage);
              pushLog("rollback", "failed", `Rollback failed for ${plan.id}: ${rollbackMessage}`, plan.id, Date.now() - planStartedAt);
            }
          } else {
            pushLog("rollback", "skipped", `No rollback adapter configured for ${plan.id}`, plan.id, Date.now() - planStartedAt);
          }

          session.status = "failed";
          break;
        }
      }

      if (session.status !== "failed") {
        session.status = "succeeded";
      }

      pushLog("finish", session.status === "succeeded" ? "succeeded" : "failed", "Execution finished", undefined, Date.now() - startedAt);
    } finally {
      session.finishedAt = new Date().toISOString();
      session.durationMs = Date.now() - startedAt;
    }

    return {
      success: session.status === "succeeded",
      status: session.status,
      session,
      logs,
      errors,
      durationMs: session.durationMs ?? 0,
    };
  }
}
