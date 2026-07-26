import type { PlannedTask } from "./TaskDecomposer.js";

export class MilestonePlanner {
  plan(tasks: PlannedTask[]): string[] {
    return [
      "Planning complete",
      ...tasks.slice(0, 2).map((task) => `Deliver ${task.title}`),
      "Validation complete",
    ];
  }
}
