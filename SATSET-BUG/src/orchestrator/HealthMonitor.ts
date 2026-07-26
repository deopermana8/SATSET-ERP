import type { Context } from "../core/Context.js";

export interface HealthSnapshot {
  cpu: number;
  ram: number;
  disk: number;
  buildTimeMs: number;
  compileTimeMs: number;
  repairCount: number;
  retryCount: number;
  coverage: number;
}

export class HealthMonitor {
  capture(context: Context): HealthSnapshot {
    return {
      cpu: 40,
      ram: 60,
      disk: 30,
      buildTimeMs: 1200,
      compileTimeMs: 900,
      repairCount: context.repairLog?.length ?? 0,
      retryCount: 0,
      coverage: 90,
    };
  }
}
