export class EngineMetrics {
  private readonly stats = new Map<string, { executionCount: number; success: number; failure: number; averageRuntimeMs: number; confidence: number; reuse: number; repairRate: number }>();

  record(name: string, runtimeMs: number, success: boolean, confidence: number, reused: boolean, repaired: boolean): void {
    const current = this.stats.get(name) ?? { executionCount: 0, success: 0, failure: 0, averageRuntimeMs: 0, confidence: 0, reuse: 0, repairRate: 0 };
    current.executionCount += 1;
    if (success) {
      current.success += 1;
    } else {
      current.failure += 1;
    }
    current.averageRuntimeMs = (current.averageRuntimeMs * (current.executionCount - 1) + runtimeMs) / current.executionCount;
    current.confidence = (current.confidence * (current.executionCount - 1) + confidence) / current.executionCount;
    current.reuse = reused ? current.reuse + 1 : current.reuse;
    current.repairRate = repaired ? (current.repairRate + 1) : current.repairRate;
    this.stats.set(name, current);
  }

  get(name: string) {
    return this.stats.get(name);
  }

  all() {
    return Array.from(this.stats.entries()).map(([name, metrics]) => ({ name, ...metrics }));
  }
}
