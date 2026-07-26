import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";

export interface TaskNode {
  id: string;
  type: string;
  dependencies: string[];
  priority: number;
  estimatedDurationMs: number;
  maxRetry: number;
  rollback: boolean;
  resume: boolean;
}

export interface TaskGraphOutput {
  tasks: TaskNode[];
  order: string[];
}

export class TaskGraphEngine implements IEngine {
  public readonly name = "TaskGraphEngine";

  async run(context: Context): Promise<void> {
    const graph: TaskGraphOutput = {
      tasks: [
        { id: "planner", type: "planner", dependencies: [], priority: 100, estimatedDurationMs: 1000, maxRetry: 1, rollback: false, resume: true },
        { id: "architecture", type: "architecture", dependencies: ["planner"], priority: 90, estimatedDurationMs: 1000, maxRetry: 1, rollback: true, resume: true },
        { id: "generate", type: "generate", dependencies: ["architecture"], priority: 80, estimatedDurationMs: 1500, maxRetry: 2, rollback: true, resume: true },
        { id: "compile", type: "compile", dependencies: ["generate"], priority: 70, estimatedDurationMs: 2000, maxRetry: 2, rollback: true, resume: true },
        { id: "test", type: "test", dependencies: ["compile"], priority: 60, estimatedDurationMs: 2000, maxRetry: 2, rollback: true, resume: true },
        { id: "verify", type: "verify", dependencies: ["test"], priority: 50, estimatedDurationMs: 1000, maxRetry: 1, rollback: true, resume: true },
      ],
      order: ["planner", "architecture", "generate", "compile", "test", "verify"],
    };

    context.metadata = {
      ...context.metadata,
      taskGraph: graph,
    } as typeof context.metadata & { taskGraph?: TaskGraphOutput };
  }
}
