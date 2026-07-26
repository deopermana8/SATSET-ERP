export class CQRSPlanner {
  plan(): string[] {
    return ["command-side", "query-side", "event-bus"];
  }
}
