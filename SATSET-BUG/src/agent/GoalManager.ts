import fs from "node:fs/promises";
import path from "node:path";
import type { AgentGoal } from "./ExecutionContext.js";

export interface GoalStore {
  goals: AgentGoal[];
}

export class GoalManager {
  constructor(private readonly root: string = process.cwd()) {}

  async createGoal(title: string, description: string = title): Promise<AgentGoal> {
    const goals = await this.loadGoals();
    const goal: AgentGoal = {
      id: `goal-${goals.goals.length + 1}`,
      title,
      description,
      status: "planned",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goals.goals.push(goal);
    await this.persistGoals(goals);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<AgentGoal>): Promise<AgentGoal> {
    const goals = await this.loadGoals();
    const index = goals.goals.findIndex((goal) => goal.id === id);
    if (index < 0) {
      throw new Error(`Goal ${id} not found`);
    }
    const updated = { ...goals.goals[index], ...updates, updatedAt: new Date().toISOString() };
    goals.goals[index] = updated;
    await this.persistGoals(goals);
    return updated;
  }

  async listGoals(): Promise<AgentGoal[]> {
    const goals = await this.loadGoals();
    return goals.goals;
  }

  private async loadGoals(): Promise<GoalStore> {
    const filePath = this.getGoalFilePath();
    try {
      const content = await fs.readFile(filePath, "utf8");
      return JSON.parse(content) as GoalStore;
    } catch {
      return { goals: [] };
    }
  }

  private async persistGoals(goals: GoalStore): Promise<void> {
    const filePath = this.getGoalFilePath();
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(goals, null, 2), "utf8");
  }

  private getGoalFilePath(): string {
    return path.join(this.root, "knowledge", "goals.json");
  }
}
