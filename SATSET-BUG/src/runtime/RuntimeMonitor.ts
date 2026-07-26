import type { Context } from "../core/Context.js";

export interface RuntimeMetrics {
  cpuTimeMs: number;
  memoryUsedMb: number;
  durationMs: number;
  engineLatencyMs: Record<string, number>;
  retryCount: Record<string, number>;
  repairCount: Record<string, number>;
  cacheHit: Record<string, number>;
  knowledgeReuse: Record<string, number>;
  benchmarkScore: number;
  qualityScore: number;
  healthScore: number;
}

export class RuntimeMonitor {
  collect(context: Context, details: Partial<RuntimeMetrics> = {}): RuntimeMetrics {
    const memoryUsedMb = Math.max(0, Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 10) / 10);
    return {
      cpuTimeMs: details.cpuTimeMs ?? 0,
      memoryUsedMb,
      durationMs: details.durationMs ?? 0,
      engineLatencyMs: details.engineLatencyMs ?? {},
      retryCount: details.retryCount ?? {},
      repairCount: details.repairCount ?? {},
      cacheHit: details.cacheHit ?? {},
      knowledgeReuse: details.knowledgeReuse ?? {},
      benchmarkScore: details.benchmarkScore ?? 0,
      qualityScore: details.qualityScore ?? 0,
      healthScore: details.healthScore ?? 0,
    };
  }
}
