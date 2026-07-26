import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { AgentPlan, AgentTask } from "./ExecutionContext.js";

export class AgentPlanner {
  constructor(private readonly root: string = process.cwd()) {}

  async planGoal(goal: string, context: Context): Promise<AgentPlan> {
    const tasks: AgentTask[] = [
      { id: "task-1", title: "inspect context", type: "analyze", priority: 1, status: "pending", attempts: 0, summary: `Analyze ${goal}` },
      { id: "task-2", title: "repair implementation", type: "repair", priority: 2, status: "pending", attempts: 0, summary: `Repair for ${goal}` },
      { id: "task-3", title: "verify outcome", type: "verify", priority: 3, status: "pending", attempts: 0, summary: `Verify ${goal}` },
    ];

    const plan: AgentPlan = {
      goal,
      tasks,
      createdAt: new Date().toISOString(),
      status: "planned",
    };

    await this.persist(plan, context);
    return plan;
  }

  private async persist(plan: AgentPlan, context: Context): Promise<void> {
    const filePath = path.join(this.root, "knowledge", "task-tree.json");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ goal: context.projectName, tasks: plan.tasks, createdAt: plan.createdAt, status: plan.status }, null, 2), "utf8");
  }
}
