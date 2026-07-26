import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";

export interface RuntimeMetricsReport {
  executionTimeMs: number;
  memoryUsageMb: number;
  cpuUsagePercent: number;
  warnings: number;
  errors: number;
  retries: number;
  knowledgeReuse: number;
  confidence: number;
}

export class RuntimeMetricsEngine {
  async collect(context: Context, metrics: RuntimeMetricsReport): Promise<RuntimeMetricsReport> {
    const outputPath = path.join(context.projectRoot, "knowledge", "runtime-metrics.json");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(metrics, null, 2), "utf8");
    context.metadata = {
      ...context.metadata,
      runtimeMetrics: metrics,
    } as typeof context.metadata & { runtimeMetrics?: RuntimeMetricsReport };
    return metrics;
  }
}
