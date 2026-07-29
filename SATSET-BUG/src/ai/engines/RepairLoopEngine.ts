import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { AutoRepairEngine } from "../../autofix/AutoRepairEngine.js";
import { CompileEngine } from "./CompileEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface RepairLoopMetrics {
  attempts: number;
  maxAttempts: number;
  completed: boolean;
  reason: string;
}

export class RepairLoopEngine implements IEngine {
  public readonly name = "RepairLoopEngine";

  async run(context: Context): Promise<void> {
    const loop: RepairLoopMetrics = {
      attempts: 0,
      maxAttempts: 3,
      completed: true,
      reason: "passed",
    };

    const existingReason = context.repairLoop?.reason;
    const currentIssues = context.getIssues();
    const canShortCircuit =
      context.repairLoop?.completed &&
      currentIssues.length === 0 &&
      existingReason !== undefined &&
      ["resolved", "no-issues"].includes(existingReason);

    if (canShortCircuit) {
      loop.attempts = context.repairLoop?.attempt ?? 1;
      loop.reason = existingReason;
      context.repairLoop = {
        attempt: loop.attempts,
        completed: loop.completed,
        reason: loop.reason,
      };
      return;
    }
    let loopReason = "passed";

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "repair-loop-progress",
      name: "repair-loop-progress",
      templatePath: path.join(context.projectRoot, "templates", "repair-progress.json.tpl"),
      outputPath: path.join(context.projectRoot, ".progress.json"),
      variables: {
        currentStage: "repair",
        progress: "80",
        currentTask: "repairing issues",
        estimatedRemaining: "15s",
      },
    }]);

    for (let index = 0; index < loop.maxAttempts; index += 1) {
      loop.attempts = index + 1;
      const compileEngine = new CompileEngine();
      await compileEngine.run(context);

      // Check if compilation succeeded and no issues remain
      const currentIssues = context.getIssues();
      if (currentIssues.length === 0) {
        loopReason = "no-issues";
        break;
      }

      // Attempt repair if issues are present
      const repairEngine = new AutoRepairEngine();
      await repairEngine.run(context);

      // Check the repair outcome from the repair loop state
      const repairOutcome = context.repairLoop?.reason;
      loopReason = repairOutcome ?? "passed";

      // Stop looping if repair was successful or fully resolved
      if (repairOutcome === "resolved" || repairOutcome === "no-issues") {
        break;
      }

      // Stop looping on terminal failure states
      if (repairOutcome === "failed" || repairOutcome === "ineffective") {
        break;
      }

      // Stop if no repair attempts were made
      if (repairOutcome === "no-repair-plans" || repairOutcome === "no-change") {
        break;
      }
    }

    loop.reason = loopReason;
    context.repairLoop = {
      attempt: loop.attempts,
      completed: loop.completed,
      reason: loop.reason,
    };
  }
}
