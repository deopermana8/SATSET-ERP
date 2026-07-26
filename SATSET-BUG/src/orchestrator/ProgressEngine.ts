import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";

export interface ProgressSnapshot {
  currentStage: string;
  progress: number;
  currentTask: string;
  estimatedRemaining: string;
}

export class ProgressEngine implements IEngine {
  public readonly name = "ProgressEngine";

  async run(context: Context): Promise<void> {
    const snapshot: ProgressSnapshot = {
      currentStage: "orchestrating",
      progress: 70,
      currentTask: "running tasks",
      estimatedRemaining: "15s",
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "progress-json",
      name: "progress-json",
      templatePath: path.join(context.projectRoot, "templates", "progress.json.tpl"),
      outputPath: path.join(context.projectRoot, ".progress.json"),
      variables: {
        currentStage: snapshot.currentStage,
        progress: String(snapshot.progress),
        currentTask: snapshot.currentTask,
        estimatedRemaining: snapshot.estimatedRemaining,
      },
    }]);

    context.metadata = {
      ...context.metadata,
      progress: snapshot,
    } as typeof context.metadata & { progress?: ProgressSnapshot };
  }
}
