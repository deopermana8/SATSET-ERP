import type { PlannedTask } from "./TaskDecomposer.js";

export class DependencyPlanner {
  plan(tasks: PlannedTask[]): string[] {
    return tasks.flatMap((task) => task.dependsOn.map((dependency) => `${task.id} -> ${dependency}`));
  }
}
