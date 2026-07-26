import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { AgentCoordinator } from "./AgentCoordinator.js";

export interface AgentExecutionReport {
  goal: string;
  status: string;
  goalId: string;
}

export class AgentOrchestrationEngine implements IEngine {
  public readonly name = "AgentOrchestrationEngine";

  constructor(private readonly coordinator: AgentCoordinator = new AgentCoordinator()) {}

  async run(context: Context): Promise<void> {
    const goal = this.getGoal(context);
    const result = await this.coordinator.run(goal, context);
    const report: AgentExecutionReport = {
      goal,
      status: result.status,
      goalId: result.goalId,
    };

    const reportPath = path.join(context.projectRoot, "knowledge", "execution-report.json");
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    context.metadata = {
      ...context.metadata,
      agentRuntime: report,
    } as typeof context.metadata & { agentRuntime?: AgentExecutionReport };
  }

  private getGoal(context: Context): string {
    const candidate = (context.metadata as Record<string, unknown> | undefined)?.agentGoal;
    return typeof candidate === "string" && candidate.trim().length > 0
      ? candidate
      : `Autonomous coding task for ${context.projectName}`;
  }
}
