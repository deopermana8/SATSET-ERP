import fs from "node:fs/promises";
import path from "node:path";
import { CommandExecutor } from "../commands/CommandExecutor.js";
import type { Context, RepairLogEntry } from "../core/Context.js";
import { RepairPlanner } from "./RepairPlanner.js";
import type { IEngine } from "../core/IEngine.js";

export class RepairEngine implements IEngine {
  public readonly name = "RepairEngine";
  private readonly planner: RepairPlanner;
  private readonly executor: CommandExecutor;

  constructor(planner?: RepairPlanner, executor?: CommandExecutor) {
    this.planner = planner ?? new RepairPlanner();
    this.executor = executor ?? new CommandExecutor();
  }

  async run(context: Context): Promise<void> {
    const rootCauses = context.rootCauses ?? [];
    const repairPlans = (context.repairPlans?.length ? context.repairPlans : rootCauses.map((rootCause) => this.planner.plan(rootCause))).slice();
    context.repairPlans = repairPlans;

    const repairOptions = context.repairOptions ?? {};
    const maxSteps = repairOptions.maxSteps ?? Number.MAX_SAFE_INTEGER;
    let stepCount = 0;

    for (const plan of repairPlans) {
      for (const step of plan.steps) {
        if (stepCount >= maxSteps) {
          this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "skipped", "Reached the configured repair-step limit.", undefined);
          break;
        }

        const action = this.resolveAction(step);
        if (!action) {
          this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "skipped", "No executable repair action matched the step.", undefined);
          stepCount += 1;
          continue;
        }

        if (!step.automatic && !this.canAutoApply(step)) {
          this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "skipped", "No executable repair action matched the step.", undefined);
          stepCount += 1;
          continue;
        }

        const targetPath = path.resolve(context.projectRoot, action.filePath);
        const status = repairOptions.dryRun ? "dry-run" : "applied";
        const message = repairOptions.dryRun
          ? `Dry-run: would ${action.description.toLowerCase()} (${path.relative(context.projectRoot, targetPath) || action.filePath}).`
          : `${action.description} (${path.relative(context.projectRoot, targetPath) || action.filePath}).`;

        let retryCount = 0;
        if (!repairOptions.dryRun) {
          const applied = await this.applyAction(targetPath, action, context);
          if (!applied) {
            this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, "failed", `Repair action failed for ${path.relative(context.projectRoot, targetPath) || action.filePath}.`, targetPath, "failed", retryCount);
            continue;
          }
          retryCount += 1;
        }

        this.pushLog(context, plan.id, plan.rootCauseId, step.id, step.title, status, message, targetPath, undefined, retryCount);
        stepCount += 1;
      }
    }
  }

  private canAutoApply(step: { title: string; description: string; automatic?: boolean }): boolean {
    return step.automatic === true || /auto|generate|tsconfig|prisma|typescript/i.test(`${step.title}\n${step.description}`);
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

  private async applyAction(targetPath: string, action: { filePath: string; content: string; description: string }, context: Context): Promise<boolean> {
    try {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      const exists = await fs.access(targetPath).then(() => true).catch(() => false);
      if (exists) {
        await fs.copyFile(targetPath, `${targetPath}.bak`);
      }
      await fs.writeFile(targetPath, action.content, "utf8");
      if (context.projectRoot) {
        await this.executor.pnpm(["--version"], context.projectRoot);
      }
      return true;
    } catch {
      return false;
    }
  }

  private pushLog(context: Context, planId: string | undefined, rootCauseId: string | undefined, stepId: string | undefined, title: string, status: RepairLogEntry["status"], message: string, filePath: string | undefined, rollbackStatus?: RepairLogEntry["rollbackStatus"], retryCount?: number): void {
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
      retryCount,
    };
    context.repairLog = [...(context.repairLog ?? []), entry];
  }
}

export default RepairEngine;
