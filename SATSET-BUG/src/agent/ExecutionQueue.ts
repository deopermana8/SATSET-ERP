import type { AgentTask } from "./ExecutionContext.js";

export interface ExecutionQueueProgress {
  completed: number;
  total: number;
  pending: number;
}

export class ExecutionQueue {
  private readonly pending: AgentTask[] = [];
  private readonly completed: AgentTask[] = [];

  enqueue(task: AgentTask): void {
    this.pending.push(task);
  }

  dequeue(): AgentTask | undefined {
    const next = this.pending.shift();
    if (next) {
      this.completed.push(next);
    }
    return next;
  }

  getProgress(): ExecutionQueueProgress {
    return {
      completed: this.completed.length,
      total: this.completed.length + this.pending.length,
      pending: this.pending.length,
    };
  }
}
