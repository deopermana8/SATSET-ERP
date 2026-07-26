import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import type { TaskGraphOutput } from "./TaskGraphEngine.js";

export interface SchedulerOutput {
  scheduled: string[];
  concurrency: number;
}

export class SchedulerEngine implements IEngine {
  public readonly name = "SchedulerEngine";

  async run(context: Context): Promise<void> {
    const graph = (context.metadata as { taskGraph?: TaskGraphOutput } | undefined)?.taskGraph;
    const scheduled = graph?.order ?? ["planner", "architecture", "generate", "compile", "test", "verify"];
    const output: SchedulerOutput = {
      scheduled,
      concurrency: 2,
    };

    context.metadata = {
      ...context.metadata,
      scheduler: output,
    } as typeof context.metadata & { scheduler?: SchedulerOutput };
  }
}
