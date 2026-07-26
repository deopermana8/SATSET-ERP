import type { Context } from "../core/Context.js";
import { AgentPlanner } from "./AgentPlanner.js";
import { ExecutionQueue } from "./ExecutionQueue.js";
import { TaskExecutor } from "./TaskExecutor.js";
import { GoalManager } from "./GoalManager.js";
import { AgentMemory } from "./AgentMemory.js";
import { ExecutionHistory } from "./ExecutionHistory.js";

export class AgentCoordinator {
  constructor(
    private readonly root: string = process.cwd(),
    private readonly planner: AgentPlanner = new AgentPlanner(root),
    private readonly queue: ExecutionQueue = new ExecutionQueue(),
    private readonly executor: TaskExecutor = new TaskExecutor(root),
    private readonly goals: GoalManager = new GoalManager(root),
    private readonly memory: AgentMemory = new AgentMemory(root),
    private readonly history: ExecutionHistory = new ExecutionHistory(root)
  ) {}

  async run(goal: string, context: Context): Promise<{ goalId: string; status: string }> {
    const createdGoal = await this.goals.createGoal(goal);
    const plan = await this.planner.planGoal(goal, context);
    plan.tasks.forEach((task) => this.queue.enqueue(task));

    while (this.queue.getProgress().pending > 0) {
      const task = this.queue.dequeue();
      if (!task) {
        break;
      }
      await this.executor.execute(task, createdGoal.id);
    }

    await this.goals.updateGoal(createdGoal.id, { status: "completed" });
    await this.memory.record({ goalId: createdGoal.id, taskId: "summary", status: "completed", summary: `Completed ${goal}` });
    this.history.push({ id: `summary-${createdGoal.id}`, goalId: createdGoal.id, taskId: "summary", status: "completed", summary: `Completed ${goal}`, timestamp: new Date().toISOString() });

    return { goalId: createdGoal.id, status: "completed" };
  }
}
