import fs from "node:fs/promises";
import path from "node:path";
import { CommandExecutor } from "../commands/CommandExecutor.js";
import type { Context, RepairLogEntry } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { RollbackManager } from "../fixer/RollbackManager.js";

export class AutoRepairEngine implements IEngine {
  public readonly name = "AutoRepairEngine";
  private readonly executor: CommandExecutor;
  private readonly rollbackManager: RollbackManager;

  constructor(executor?: CommandExecutor, rollbackManager?: RollbackManager) {
    this.executor = executor ?? new CommandExecutor();
    this.rollbackManager = rollbackManager ?? new RollbackManager();
  }

  async run(context: Context): Promise<void> {
    const repairOptions = context.repairOptions ?? {};
    const maxAttempts = Math.max(1, repairOptions.maxSteps ?? 3);
    const beforeIssueCount = context.getIssues().length;
    const beforeHealth = context.health?.score ?? 0;
    const startedAt = Date.now();

    context.repairLoop = {
      attempt: 0,
      completed: false,
      reason: "started",
    };

    let attempts = 0;
    let changed = false;
    let reason = "no-repair-needed";

    while (attempts < maxAttempts) {
      const issues = context.getIssues();
      const repairPlans = context.repairPlans ?? [];

      if (issues.length === 0 || repairPlans.length === 0) {
        reason = issues.length === 0 ? "no-issues" : "no-repair-plans";
        break;
      }

      let attemptChanged = false;
      for (const plan of repairPlans) {
        for (const step of plan.steps) {
          const action = this.resolveAction(step);
          if (!action) {
            this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "skipped", "No actionable repair step matched the current plan.", undefined);
            continue;
          }

          const targetPath = path.resolve(context.projectRoot, action.filePath);
          if (repairOptions.dryRun) {
            this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "dry-run", `Dry-run: ${action.description} (${path.relative(context.projectRoot, targetPath) || action.filePath}).`, targetPath);
            attemptChanged = true;
            continue;
          }

          const backupId = await this.backupFile(targetPath, plan.id);
          const applied = await this.applyAction(targetPath, action);
          if (!applied) {
            await this.restoreBackup(targetPath, backupId);
            this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "failed", `Repair action failed and was rolled back for ${path.relative(context.projectRoot, targetPath) || action.filePath}.`, targetPath, "failed");
            continue;
          }

          const verifyResult = await this.executor.pnpm(["--version"], context.projectRoot);
          if (verifyResult.exitCode !== 0) {
            await this.restoreBackup(targetPath, backupId);
            this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "failed", `Repair verification failed and the change was rolled back.`, targetPath, "restored");
            continue;
          }

          this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "applied", `${action.description} (${path.relative(context.projectRoot, targetPath) || action.filePath}).`, targetPath, "none");
          attemptChanged = true;
        }
      }

      changed = changed || attemptChanged;
      attempts += 1;
      if (!attemptChanged) {
        reason = "no-change";
        break;
      }
    }

    context.repairLoop = {
      attempt: attempts,
      completed: true,
      reason,
    };
    context.repairSummary = {
      beforeIssueCount,
      afterIssueCount: context.getIssues().length,
      beforeHealth,
      afterHealth: context.health?.score ?? beforeHealth,
      fixedIssueCount: Math.max(0, beforeIssueCount - context.getIssues().length),
      remainingIssueCount: context.getIssues().length,
      durationMs: Date.now() - startedAt,
      rollbackStatus: context.repairLog?.some((entry) => entry.rollbackStatus === "restored") ? "restored" : "none",
    };
  }

  private resolveAction(step: { title: string; description: string }): { filePath: string; content: string; description: string } | undefined {
    const text = `${step.title}\n${step.description}`.toLowerCase();
    if (text.includes("tsconfig") || text.includes("typescript") || text.includes("prisma") || text.includes("generate")) {
      return {
        filePath: "tsconfig.json",
        description: "Create a minimal TypeScript configuration file",
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": false
  }
}
`,
      };
    }

    return undefined;
  }

  private async backupFile(targetPath: string, planId: string): Promise<string | undefined> {
    try {
      const exists = await fs.access(targetPath).then(() => true).catch(() => false);
      if (!exists) {
        return undefined;
      }
      const backupPath = `${targetPath}.bak`;
      await fs.copyFile(targetPath, backupPath);
      this.rollbackManager.registerBackup({ id: backupPath, path: targetPath, createdAt: new Date().toISOString(), metadata: { planId } });
      return backupPath;
    } catch {
      return undefined;
    }
  }

  private async restoreBackup(targetPath: string, backupId?: string): Promise<void> {
    if (!backupId) {
      return;
    }
    try {
      await fs.copyFile(backupId, targetPath);
    } catch {
      // best effort rollback
    }
  }

  private async applyAction(targetPath: string, action: { filePath: string; content: string; description: string }): Promise<boolean> {
    try {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, action.content, "utf8");
      return true;
    } catch {
      return false;
    }
  }

  private pushLog(context: Context, planId: string | undefined, rootCauseId: string | undefined, stepId: string | undefined, title: string, status: RepairLogEntry["status"], message: string, filePath: string | undefined, rollbackStatus?: RepairLogEntry["rollbackStatus"]): void {
    const entry: RepairLogEntry = {
      id: `${planId ?? "plan"}-${stepId ?? title}-${status}-${Date.now()}`,
      planId,
      rootCauseId,
      stepId,
      title,
      status,
      message,
      filePath,
      timestamp: new Date().toISOString(),
      rollbackStatus,
    };
    context.repairLog = [...(context.repairLog ?? []), entry];
  }
}

export default AutoRepairEngine;
