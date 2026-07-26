import type { AgentTask } from "./ExecutionContext.js";

export class TaskPlanner {
  plan(goal: string): AgentTask[] {
    return [
      { id: "plan-1", title: `decompose ${goal}`, type: "analyze", priority: 1, status: "pending", attempts: 0 },
      { id: "plan-2", title: `execute ${goal}`, type: "repair", priority: 2, status: "pending", attempts: 0 },
      { id: "plan-3", title: `validate ${goal}`, type: "verify", priority: 3, status: "pending", attempts: 0 },
    ];
  }
}
