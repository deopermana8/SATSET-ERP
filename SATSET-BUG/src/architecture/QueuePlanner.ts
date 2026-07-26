export class QueuePlanner {
  plan(): string[] {
    return ["BullMQ", "worker", "retry-policy"];
  }
}
