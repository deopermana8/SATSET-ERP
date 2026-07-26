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
      const verification = context.verification as { passed?: boolean } | undefined;
      if (verification?.passed) {
        break;
      }
      const repairEngine = new AutoRepairEngine();
      await repairEngine.run(context);
    }

    context.metadata = {
      ...context.metadata,
      repairLoop: loop,
    } as typeof context.metadata & { repairLoop?: RepairLoopMetrics };
  }
}
