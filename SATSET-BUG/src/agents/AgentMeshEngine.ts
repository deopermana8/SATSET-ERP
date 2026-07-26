import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { AutonomousOrchestrator } from "../runtime/AutonomousOrchestrator.js";
import { EngineRegistry } from "../runtime/EngineRegistry.js";
import { ArchitectAgent } from "./ArchitectAgent.js";
import { BackendAgent } from "./BackendAgent.js";
import { FrontendAgent } from "./FrontendAgent.js";
import { DatabaseAgent } from "./DatabaseAgent.js";
import { QAAgent } from "./QAAgent.js";
import { RepairAgent } from "./RepairAgent.js";
import { SecurityAgent } from "./SecurityAgent.js";
import { PerformanceAgent } from "./PerformanceAgent.js";
import { DocumentationAgent } from "./DocumentationAgent.js";
import { DevOpsAgent } from "./DevOpsAgent.js";

export interface AgentMeshSnapshot {
  queue: string[];
  history: Array<{ agent: string; status: string; confidence: number }>;
  activeAgent?: string;
  progress: number;
  durationMs: number;
  confidence: number;
}

export class AgentMeshEngine implements IEngine {
  public readonly name = "AgentMeshEngine";

  constructor(private readonly orchestrator: AutonomousOrchestrator = new AutonomousOrchestrator(new EngineRegistry())) {}

  async run(context: Context): Promise<void> {
    const agents: IEngine[] = [
      new ArchitectAgent(),
      new BackendAgent(),
      new FrontendAgent(),
      new DatabaseAgent(),
      new QAAgent(),
      new RepairAgent(),
      new SecurityAgent(),
      new PerformanceAgent(),
      new DocumentationAgent(),
      new DevOpsAgent(),
    ];

    for (const agent of agents) {
      this.orchestrator.registerEngine(agent);
    }

    const startedAt = Date.now();
    const history: AgentMeshSnapshot["history"] = [];
    for (const agent of agents) {
      const confidence = 0.7 + Math.min(0.25, agents.indexOf(agent) * 0.02);
      try {
        await agent.run(context);
        history.push({ agent: agent.name, status: "completed", confidence });
      } catch (error) {
        history.push({ agent: agent.name, status: "failed", confidence: Math.max(0.1, confidence - 0.2) });
      }

      const mesh = (context.metadata as Record<string, unknown>).agentMesh as { history?: AgentMeshSnapshot["history"]; queue?: string[]; activeAgent?: string; progress?: number; durationMs?: number; confidence?: number } | undefined;
      const liveHistory = [...(mesh?.history ?? []), ...history];
      const snapshot: AgentMeshSnapshot = {
        queue: agents.map((item) => item.name),
        history: liveHistory,
        activeAgent: agent.name,
        progress: Math.round((history.length / Math.max(1, agents.length)) * 100),
        durationMs: Date.now() - startedAt,
        confidence: liveHistory.reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, liveHistory.length),
      };

      context.metadata = {
        ...context.metadata,
        agentMesh: snapshot,
      } as typeof context.metadata & { agentMesh?: AgentMeshSnapshot };
    }

    const finalMesh = (context.metadata as Record<string, unknown>).agentMesh as AgentMeshSnapshot | undefined;
    const snapshot: AgentMeshSnapshot = {
      queue: agents.map((agent) => agent.name),
      history: finalMesh?.history ?? history,
      activeAgent: agents[agents.length - 1]?.name,
      progress: 100,
      durationMs: Date.now() - startedAt,
      confidence: (finalMesh?.history ?? history).reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, (finalMesh?.history ?? history).length),
    };

    await fs.mkdir(path.join(context.projectRoot, "knowledge"), { recursive: true });
    await fs.writeFile(path.join(context.projectRoot, "knowledge", "agent-mesh.json"), JSON.stringify(snapshot, null, 2), "utf8");

    context.metadata = {
      ...context.metadata,
      agentMesh: snapshot,
    } as typeof context.metadata & { agentMesh?: AgentMeshSnapshot };
  }
}
