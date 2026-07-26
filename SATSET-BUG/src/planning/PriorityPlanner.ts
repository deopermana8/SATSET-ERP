import type { PlannedTask } from "./TaskDecomposer.js";

export class PriorityPlanner {
  plan(tasks: PlannedTask[]): Array<{ id: string; priority: "low" | "medium" | "high" }> {
    return tasks.map((task) => ({ id: task.id, priority: task.priority }));
  }
}
