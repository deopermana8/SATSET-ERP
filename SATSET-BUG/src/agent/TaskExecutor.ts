import type { AgentTask } from "./ExecutionContext.js";
import { AgentDecisionEngine } from "./AgentDecisionEngine.js";
import { AgentMemory } from "./AgentMemory.js";
import { ExecutionHistory } from "./ExecutionHistory.js";
import { GoalManager } from "./GoalManager.js";

export class TaskExecutor {
  constructor(
    private readonly root: string = process.cwd(),
    private readonly decisionEngine: AgentDecisionEngine = new AgentDecisionEngine(),
    private readonly memory: AgentMemory = new AgentMemory(root),
    private readonly history: ExecutionHistory = new ExecutionHistory(root),
    private readonly goals: GoalManager = new GoalManager(root)
  ) {}

  async execute(task: AgentTask, goalId: string): Promise<AgentTask> {
    task.status = "running";
    task.attempts += 1;
    await this.memory.record({ goalId, taskId: task.id, status: "running", summary: task.title });
    this.history.push({ id: `${task.id}-${task.attempts}`, goalId, taskId: task.id, status: "running", summary: task.title, timestamp: new Date().toISOString() });

    try {
      task.status = "completed";
      task.summary = `executed ${task.title}`;
      await this.memory.record({ goalId, taskId: task.id, status: "completed", summary: task.summary ?? task.title });
      this.history.push({ id: `${task.id}-${task.attempts}-done`, goalId, taskId: task.id, status: "completed", summary: task.summary ?? task.title, timestamp: new Date().toISOString() });
      return task;
    } catch (error) {
      task.status = "failed";
      task.error = error instanceof Error ? error.message : String(error);
      const decision = this.decisionEngine.decide({ status: "failed", attempts: task.attempts, error: task.error }, { goal: goalId });
      await this.memory.record({ goalId, taskId: task.id, status: "failed", summary: decision.reason, error: task.error });
      this.history.push({ id: `${task.id}-${task.attempts}-failed`, goalId, taskId: task.id, status: "failed", summary: decision.reason, error: task.error, timestamp: new Date().toISOString() });
      return task;
    }
  }
}
