import type { SwarmAgentName, SwarmTask } from "./SwarmTypes.js";
import { EventBus } from "../doctor/EventBus.js";

export class SwarmAgentRuntime {
  constructor(
    private readonly name: SwarmAgentName,
    private readonly eventBus: EventBus = new EventBus()
  ) {}

  enqueue(task: SwarmTask): void {
    this.queue.push(task);
    this.eventBus.emit({ type: "SwarmTaskQueued", timestamp: new Date().toISOString(), stage: this.name, engine: this.name, details: { taskId: task.id } });
  }

  process(): SwarmTask[] {
    const completed = this.queue.splice(0, this.queue.length);
    return completed.map((task) => ({ ...task, status: "completed" as const }));
  }

  getQueue(): SwarmTask[] {
    return [...this.queue];
  }

  private readonly queue: SwarmTask[] = [];
}
