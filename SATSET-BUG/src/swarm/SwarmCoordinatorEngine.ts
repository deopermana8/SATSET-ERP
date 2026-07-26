import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { EventBus } from "../doctor/EventBus.js";
import { SwarmAgentRuntime } from "./SwarmAgent.js";
import { SwarmCoordinator } from "./SwarmCoordinator.js";
import type { SwarmAgent, SwarmMessage, SwarmTask, SwarmAgentName } from "./SwarmTypes.js";

const AGENTS: Array<{ name: SwarmAgentName; role: string }> = [
  { name: "ArchitectAgent", role: "architecture" },
  { name: "BackendAgent", role: "backend" },
  { name: "FrontendAgent", role: "frontend" },
  { name: "DatabaseAgent", role: "database" },
  { name: "APIAgent", role: "api" },
  { name: "SecurityAgent", role: "security" },
  { name: "TestingAgent", role: "testing" },
  { name: "RepairAgent", role: "repair" },
  { name: "BenchmarkAgent", role: "benchmark" },
  { name: "DocumentationAgent", role: "documentation" },
];

export class SwarmCoordinatorEngine implements IEngine {
  public readonly name = "SwarmCoordinatorEngine";

  constructor(
    private readonly eventBus: EventBus = new EventBus(),
    private readonly coordinator: SwarmCoordinator = new SwarmCoordinator()
  ) {}

  async run(context: Context): Promise<void> {
    const runtimeByAgent = new Map<SwarmAgentName, SwarmAgentRuntime>();
    const agents: SwarmAgent[] = [];
    const tasks: SwarmTask[] = [];
    const messages: SwarmMessage[] = [];
    const history: Array<{ type: string; agent: string; taskId?: string }> = [];

    for (const agentInfo of AGENTS) {
      const runtime = new SwarmAgentRuntime(agentInfo.name, this.eventBus);
      runtimeByAgent.set(agentInfo.name, runtime);
      agents.push({ name: agentInfo.name, queue: [], active: true, role: agentInfo.role });
    }

    for (let index = 0; index < AGENTS.length; index += 1) {
      const agentInfo = AGENTS[index];
      const task: SwarmTask = {
        id: `task-${index + 1}`,
        title: `${agentInfo.name} task`,
        description: `Task for ${agentInfo.name}`,
        priority: AGENTS.length - index,
        agent: agentInfo.name,
        status: "queued",
        attempts: 0,
      };
      tasks.push(task);
      runtimeByAgent.get(agentInfo.name)?.enqueue(task);
      history.push({ type: "queued", agent: agentInfo.name, taskId: task.id });
    }

    const orderedTasks = this.coordinator.resolveConflicts(tasks);
    for (const task of orderedTasks) {
      const runtime = runtimeByAgent.get(task.agent);
      if (!runtime) {
        continue;
      }
      const completed = runtime.process();
      for (const item of completed) {
        task.status = "completed";
        history.push({ type: "completed", agent: task.agent, taskId: item.id });
        messages.push({ from: task.agent, to: task.agent, type: "status", payload: `completed ${item.id}`, timestamp: new Date().toISOString() });
      }
    }

    const swarm = {
      agents,
      tasks: orderedTasks,
      messages,
    };

    const metrics = {
      total: orderedTasks.length,
      completed: orderedTasks.filter((task) => task.status === "completed").length,
      blocked: 0,
    };

    const knowledgePath = path.join(context.projectRoot, "knowledge");
    await fs.mkdir(knowledgePath, { recursive: true });
    await fs.writeFile(path.join(knowledgePath, "swarm.json"), JSON.stringify(swarm, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgePath, "swarm-history.json"), JSON.stringify({ events: history }, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgePath, "swarm-metrics.json"), JSON.stringify(metrics, null, 2), "utf8");

    context.metadata = {
      ...context.metadata,
      swarm: swarm,
      swarmHistory: { events: history },
      swarmMetrics: metrics,
    } as typeof context.metadata & { swarm?: typeof swarm; swarmHistory?: { events: typeof history }; swarmMetrics?: typeof metrics };
  }
}
