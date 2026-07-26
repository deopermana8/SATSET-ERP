import type { SwarmTask } from "./SwarmTypes.js";

export class SwarmCoordinator {
  resolveConflicts(tasks: SwarmTask[]): SwarmTask[] {
    return [...tasks].sort((left, right) => {
      if (left.priority !== right.priority) {
        return right.priority - left.priority;
      }
      return left.id.localeCompare(right.id);
    });
  }
}
