export interface PlannedTask {
  id: string;
  title: string;
  complexity: "low" | "medium" | "high";
  dependsOn: string[];
  priority: "low" | "medium" | "high";
}

export class TaskDecomposer {
  decompose(requirements: string[]): PlannedTask[] {
    return requirements.map((requirement, index) => ({
      id: `task-${index + 1}`,
      title: requirement,
      complexity: index % 2 === 0 ? "medium" : "high",
      dependsOn: index === 0 ? [] : [`task-${index}`],
      priority: index === 0 ? "high" : "medium",
    }));
  }
}
