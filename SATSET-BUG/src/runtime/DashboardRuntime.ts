import type { Context } from "../core/Context.js";
import type { RuntimeMetrics } from "./RuntimeMonitor.js";
import type { ExecutionGraphSnapshot } from "./ExecutionGraph.js";

export interface DashboardSnapshot {
  runtimeStatus: string;
  executionGraph: ExecutionGraphSnapshot;
  engineStates: Array<{ name: string; state: string }>;
  currentPhase: string;
  remainingTasks: number;
  benchmarkTrend: number;
  qualityTrend: number;
  confidenceTrend: number;
  knowledgeGrowth: number;
}

export class DashboardRuntime {
  getSnapshot(context: Context, metrics: RuntimeMetrics, graph: ExecutionGraphSnapshot): DashboardSnapshot {
    const agentMesh = (context.metadata as Record<string, unknown>).agentMesh as {
      queue?: string[];
      history?: Array<{ agent: string; status: string; confidence: number }>;
      activeAgent?: string;
      progress?: number;
      durationMs?: number;
      confidence?: number;
    } | undefined;

    return {
      runtimeStatus: "running",
      executionGraph: graph,
      engineStates: [{ name: "Doctor", state: "running" }, { name: agentMesh?.activeAgent ?? "AgentMesh", state: "active" }],
      currentPhase: "validation",
      remainingTasks: Math.max(0, (agentMesh?.queue?.length ?? 0) - (agentMesh?.history?.length ?? 0)),
      benchmarkTrend: metrics.benchmarkScore,
      qualityTrend: metrics.qualityScore,
      confidenceTrend: agentMesh?.confidence ?? metrics.healthScore,
      knowledgeGrowth: 1 + (agentMesh?.history?.length ?? 0),
    };
  }
}
