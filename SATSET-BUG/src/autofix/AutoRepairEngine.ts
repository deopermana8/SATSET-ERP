import fs from "node:fs/promises";
import path from "node:path";
import { CommandExecutor } from "../commands/CommandExecutor.js";
import type { Context, RepairLogEntry } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { RollbackManager } from "../fixer/RollbackManager.js";
import type { IPlugin } from "../plugins/IPlugin.js";
import { PluginManager } from "../plugins/PluginManager.js";
import { PrismaScanner } from "../scanner/PrismaScanner.js";
import { deriveRepairLifecycleState, normalizeRepairState, statusToLoopReason } from "../repair/RepairLifecycle.js";
import { CommandResolver } from "../runtime/CommandResolver.js";

interface RepairExecutionResult {
  attempted: boolean;
  action: string;
  command?: string;
  operation?: string;
  success: boolean;
  changed: boolean;
  error?: string;
}

interface RepairAction {
  kind: "prisma-generate" | "file-write";
  description: string;
  filePath?: string;
  content?: string;
  command?: string;
  args?: string[];
  operation?: string;
}

type RepairActionHandler = (context: Context, action: RepairAction) => Promise<RepairExecutionResult>;

class RepairActionPlugin implements IPlugin {
  constructor(
    public readonly id: string,
    public readonly name: string,
    private readonly registerHandler: () => void
  ) {}

  register(): void {
    this.registerHandler();
  }
}

export class AutoRepairEngine implements IEngine {
  public readonly name = "AutoRepairEngine";
  private readonly executor: CommandExecutor;
  private readonly commandResolver: CommandResolver;
  private readonly rollbackManager: RollbackManager;
  private readonly scanner: PrismaScanner;
  private readonly pluginManager: PluginManager;
  private readonly actionHandlers: Map<RepairAction["kind"], RepairActionHandler>;

  constructor(executor?: CommandExecutor, rollbackManager?: RollbackManager, scanner?: PrismaScanner, commandResolver?: CommandResolver) {
    this.executor = executor ?? new CommandExecutor();
    this.commandResolver = commandResolver ?? new CommandResolver();
    this.rollbackManager = rollbackManager ?? new RollbackManager();
    this.scanner = scanner ?? new PrismaScanner();
    this.pluginManager = new PluginManager();
    this.actionHandlers = new Map<RepairAction["kind"], RepairActionHandler>();
    this.registerRepairActionPlugins();
  }

  async run(context: Context): Promise<void> {
    const repairOptions = context.repairOptions ?? {};
    const maxAttempts = Math.max(1, repairOptions.maxSteps ?? 3);
    const beforeIssues = context.getIssues();
    const beforeIssueCount = beforeIssues.length;
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
    let repairApplied = false;
    let repairAttempted = false;
    let repairExecutionSucceeded = true;
    let actualRepairAction: string | undefined;
    const failedIssueIds: string[] = [];

    repairLoop: while (attempts < maxAttempts) {
      const issues = context.getIssues();
      const repairPlans = context.repairPlans ?? [];

      if (issues.length === 0 || repairPlans.length === 0) {
        normalizeRepairState(context);
        if (repairApplied) {
          reason = "resolved";
        } else {
          reason = issues.length === 0 ? "no-issues" : "no-repair-plans";
        }
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

          repairAttempted = true;
          actualRepairAction = action.description;
          const targetPath = action.filePath ? path.resolve(context.projectRoot, action.filePath) : undefined;
          if (repairOptions.dryRun) {
            const dryRunPath = targetPath ? path.relative(context.projectRoot, targetPath) || action.filePath : action.operation ?? action.description;
            this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "dry-run", `Dry-run: ${action.description} (${dryRunPath}).`, targetPath);
            attemptChanged = true;
            continue;
          }

          const backupId = targetPath ? await this.backupFile(targetPath, plan.id) : undefined;
          const executionResult = await this.dispatchAction(context, action);
          if (!executionResult.success) {
            if (targetPath) {
              await this.restoreBackup(targetPath, backupId);
            }
            this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "failed", `Repair action failed: ${executionResult.error ?? "unknown error"}.`, targetPath, targetPath ? "restored" : "none");
            repairExecutionSucceeded = false;
            failedIssueIds.push(step.id ?? action.description);
            reason = "failed";
            attempts = maxAttempts;
            break repairLoop;
          }

          const resolved = await this.recheckIssueResolution(context);
          if (!resolved) {
            this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "failed", `Repair action was applied but the targeted issue remains unresolved.`, targetPath, "none");
            failedIssueIds.push(step.id ?? action.description);
            reason = "ineffective";
            attempts = maxAttempts;
            break repairLoop;
          }

          normalizeRepairState(context);
          this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "applied", `${action.description} (${executionResult.operation ?? action.operation ?? action.description}).`, targetPath, "none");
          repairApplied = true;
          reason = "resolved";
          attemptChanged = true;
          break;
        }
      }

      changed = changed || attemptChanged;
      attempts += 1;
      if (!attemptChanged) {
        reason = "no-change";
        break;
      }
    }

    const afterIssues = context.getIssues();
    // Check if repair execution was incomplete (e.g., due to maxSteps limit)
    const executionCompleted = (context.metadata as Record<string, unknown>)?.repairExecutionCompleted !== false;
    const lifecycle = deriveRepairLifecycleState({
      beforeIssues,
      afterIssues,
      repairAttempted,
      repairExecutionSucceeded,
      repairSkipped: false,
      repairAttemptCount: attempts,
      actualRepairAction,
      failedIssueIds,
      executionCompleted,
    });

    context.repairLoop = {
      attempt: attempts,
      completed: true,
      reason: statusToLoopReason(lifecycle.repairStatus),
    };
    context.metadata = {
      ...context.metadata,
      repairExecutionCompleted: executionCompleted,
    } as typeof context.metadata & { repairExecutionCompleted?: boolean };
    context.repairSummary = {
      beforeIssueCount,
      afterIssueCount: afterIssues.length,
      beforeHealth,
      afterHealth: context.health?.score ?? beforeHealth,
      fixedIssueCount: Math.max(0, beforeIssueCount - afterIssues.length),
      remainingIssueCount: afterIssues.length,
      durationMs: Date.now() - startedAt,
      rollbackStatus: context.repairLog?.some((entry) => entry.rollbackStatus === "restored") ? "restored" : "none",
      beforeIssueIds: lifecycle.beforeIssueIds,
      afterIssueIds: lifecycle.afterIssueIds,
      resolvedIssueIds: lifecycle.resolvedIssueIds,
      remainingIssueIds: lifecycle.remainingIssueIds,
      failedIssueIds: lifecycle.failedIssueIds,
      repairStatus: lifecycle.repairStatus,
      repairAttemptCount: lifecycle.repairAttemptCount,
      actualRepairAction: lifecycle.actualRepairAction,
      verificationPassed: lifecycle.verificationPassed,
      verificationReasons: lifecycle.verificationReasons,
    };
  }

  private async recheckIssueResolution(context: Context): Promise<boolean> {
    await this.scanner.scan(context);

    const prisma = context.metadata.prisma as Record<string, unknown> | undefined;
    if (!prisma) {
      return true;
    }

    const issues = context.getIssues();
    const prismaIssues = issues.filter((issue) => issue.category === "Prisma");

    const unresolvedFlags = [
      prisma.hasNamespacePrisma === false,
      prisma.hasPrismaClient === false,
      prisma.hasKnownRequestError === false,
      prisma.hasPrismaPromise === false,
      prisma.runtimeExists === false,
      prisma.generatedPrismaExists === false,
      prisma.schemaExists === false,
      prisma.hasGenerator === false,
      prisma.hasDatasource === false,
    ];

    if (unresolvedFlags.some(Boolean)) {
      return false;
    }

    if (prismaIssues.length > 0) {
      const remainingIssueIds = new Set(context.getIssues().filter((issue) => issue.category !== "Prisma").map((issue) => issue.id));
      context.issues = context.issues.filter((issue) => issue.category !== "Prisma");
      context.diagnosis = (context.diagnosis ?? []).filter((entry) => remainingIssueIds.has(entry.id));
    }
    return true;
  }

  private resolveAction(step: { title: string; description: string }): RepairAction | undefined {
    const text = `${step.title}\n${step.description}`.toLowerCase();
    if (text.includes("prisma")) {
      return {
        kind: "prisma-generate",
        description: "Run Prisma client generation",
        command: "prisma",
        args: ["generate"],
        operation: "prisma generate",
      };
    }

    if (text.includes("tsconfig") || text.includes("typescript")) {
      return {
        kind: "file-write",
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
        operation: "write tsconfig.json",
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

  private async dispatchAction(context: Context, action: RepairAction): Promise<RepairExecutionResult> {
    const handler = this.actionHandlers.get(action.kind);
    if (handler) {
      return handler(context, action);
    }

    if (!action.filePath || !action.content) {
      return { attempted: true, action: action.description, success: false, changed: false, error: "No file target was defined for the repair action." };
    }

    const targetPath = path.resolve(context.projectRoot, action.filePath);
    try {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, action.content, "utf8");
      return { attempted: true, action: action.description, operation: action.operation, success: true, changed: true };
    } catch (error) {
      return { attempted: true, action: action.description, operation: action.operation, success: false, changed: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private registerRepairActionPlugins(): void {
    this.pluginManager.register(
      new RepairActionPlugin("autofix-prisma-dispatch", "AutoFix Prisma Dispatch", () => {
        this.actionHandlers.set("prisma-generate", async (context, action) => {
          const args = action.args ?? ["generate"];
          const result = await this.executor.prisma(args, context.projectRoot);
          return {
            attempted: true,
            action: action.description,
            command: `prisma ${args.join(" ")}`.trim(),
            operation: action.operation,
            success: result.exitCode === 0,
            changed: result.exitCode === 0,
            error: result.exitCode === 0 ? undefined : result.stderr || result.stdout || "Prisma generation failed",
          };
        });
      })
    );

    this.pluginManager.registerAll();
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
