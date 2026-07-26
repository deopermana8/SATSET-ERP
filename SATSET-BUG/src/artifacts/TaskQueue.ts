export interface TaskQueueItem<T> {
  id: string;
  payload: T;
  attempts: number;
}

export interface TaskQueueProgress {
  completed: number;
  total: number;
  pending: number;
  etaMs: number;
}

export class TaskQueue<T> {
  private readonly items: TaskQueueItem<T>[] = [];
  private readonly completed: Array<{ id: string; payload: T }> = [];
  private readonly logs: Array<{ id: string; message: string }> = [];

  enqueue(id: string, payload: T): void {
    this.items.push({ id, payload, attempts: 0 });
  }

  async run(handler: (payload: T, item: TaskQueueItem<T>) => Promise<void>): Promise<void> {
    while (this.items.length > 0) {
      const item = this.items.shift();
      if (!item) {
        break;
      }

      try {
        await handler(item.payload, item);
        this.completed.push({ id: item.id, payload: item.payload });
        this.logs.push({ id: item.id, message: "completed" });
      } catch (error) {
        item.attempts += 1;
        this.logs.push({ id: item.id, message: error instanceof Error ? error.message : String(error) });
        if (item.attempts < 3) {
          this.items.push(item);
        }
      }
    }
  }

  getProgress(): TaskQueueProgress {
    return {
      completed: this.completed.length,
      total: this.completed.length + this.items.length,
      pending: this.items.length,
      etaMs: this.items.length * 1000,
    };
  }

  getLogs(): Array<{ id: string; message: string }> {
    return [...this.logs];
  }
}
