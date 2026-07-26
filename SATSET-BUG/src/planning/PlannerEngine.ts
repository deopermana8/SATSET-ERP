import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { RequirementAnalyzer } from "./RequirementAnalyzer.js";
import { TaskDecomposer } from "./TaskDecomposer.js";
import { DependencyPlanner } from "./DependencyPlanner.js";
import { PriorityPlanner } from "./PriorityPlanner.js";
import { MilestonePlanner } from "./MilestonePlanner.js";
import { RiskAnalyzer } from "./RiskAnalyzer.js";
import { AcceptancePlanner } from "./AcceptancePlanner.js";

export interface PlanningSnapshot {
  requirements: string[];
  tasks: Array<{ id: string; title: string; complexity: string; dependsOn: string[]; priority: string }>;
  dependencies: string[];
  priorities: Array<{ id: string; priority: string }>;
  milestones: string[];
  risks: Array<{ id: string; description: string; severity: string }>;
  acceptance: string[];
}

export class PlannerEngine implements IEngine {
  public readonly name = "PlannerEngine";

  async run(context: Context): Promise<void> {
    const analyzer = new RequirementAnalyzer();
    const decomposer = new TaskDecomposer();
    const dependencyPlanner = new DependencyPlanner();
    const priorityPlanner = new PriorityPlanner();
    const milestonePlanner = new MilestonePlanner();
    const riskAnalyzer = new RiskAnalyzer();
    const acceptancePlanner = new AcceptancePlanner();

    const requirements = analyzer.analyze(context);
    const tasks = decomposer.decompose(requirements);
    const snapshot: PlanningSnapshot = {
      requirements,
      tasks: tasks.map((task) => ({ ...task, complexity: task.complexity, priority: task.priority })),
      dependencies: dependencyPlanner.plan(tasks),
      priorities: priorityPlanner.plan(tasks),
      milestones: milestonePlanner.plan(tasks),
      risks: riskAnalyzer.analyze(),
      acceptance: acceptancePlanner.plan(),
    };

    const knowledgePath = path.join(context.projectRoot, "knowledge");
    await fs.mkdir(knowledgePath, { recursive: true });
    await fs.writeFile(path.join(knowledgePath, "plans.json"), JSON.stringify(snapshot, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgePath, "tasks.json"), JSON.stringify({ tasks }, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgePath, "roadmap.json"), JSON.stringify({ milestones: snapshot.milestones, dependencies: snapshot.dependencies }, null, 2), "utf8");

    context.metadata = {
      ...context.metadata,
      planning: snapshot,
    } as typeof context.metadata & { planning?: PlanningSnapshot };
  }
}
