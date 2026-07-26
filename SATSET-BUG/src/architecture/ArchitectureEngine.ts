import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ArchitectureAnalyzer } from "./ArchitectureAnalyzer.js";
import { ArchitectureDecisionEngine } from "./ArchitectureDecisionEngine.js";
import { ArchitectureScorer } from "./ArchitectureScorer.js";
import { ArchitectureKnowledge } from "./ArchitectureKnowledge.js";
import { PatternEngine } from "./PatternEngine.js";
import { PatternCatalog } from "./PatternCatalog.js";
import { DDDPlanner } from "./DDDPlanner.js";
import { CleanArchitecturePlanner } from "./CleanArchitecturePlanner.js";
import { HexagonalPlanner } from "./HexagonalPlanner.js";
import { LayeredPlanner } from "./LayeredPlanner.js";
import { MonolithPlanner } from "./MonolithPlanner.js";
import { MicroservicePlanner } from "./MicroservicePlanner.js";
import { ModularMonolithPlanner } from "./ModularMonolithPlanner.js";
import { RepositoryPlanner } from "./RepositoryPlanner.js";
import { CQRSPlanner } from "./CQRSPlanner.js";
import { EventDrivenPlanner } from "./EventDrivenPlanner.js";
import { ApiPlanner } from "./ApiPlanner.js";
import { DatabasePlanner } from "./DatabasePlanner.js";
import { CachingPlanner } from "./CachingPlanner.js";
import { QueuePlanner } from "./QueuePlanner.js";
import { SecurityPlanner } from "./SecurityPlanner.js";
import { LoggingPlanner } from "./LoggingPlanner.js";
import { ObservabilityPlanner } from "./ObservabilityPlanner.js";
import { DeploymentPlanner } from "./DeploymentPlanner.js";

export interface ArchitectureSnapshot {
  architecture: string;
  score: number;
  complexity: string;
  scalability: number;
  maintainability: number;
  risk: number;
  deploymentStrategy: string;
  dataStrategy: string;
  apiStrategy: string;
  securityStrategy: string;
  testingStrategy: string;
  moduleBoundaries: string[];
  packageOrganization: string[];
  namingConvention: string;
  decisions: Array<{ id: string; name: string; confidence: number; rationale: string }>;
  patterns: string[];
}

export class ArchitectureEngine implements IEngine {
  public readonly name = "ArchitectureEngine";

  async run(context: Context): Promise<void> {
    const analyzer = new ArchitectureAnalyzer();
    const analysis = analyzer.analyze(context);
    const decisionEngine = new ArchitectureDecisionEngine();
    const decision = decisionEngine.decide(context);
    const scorer = new ArchitectureScorer();
    const candidates = [
      { name: "Monolith", rationale: "Simple default choice", complexity: analysis.complexity },
      { name: "Modular Monolith", rationale: "Balances clarity and scalability", complexity: analysis.complexity },
      { name: "Microservice", rationale: "Best for very large systems", complexity: "large" },
    ];
    const scored = scorer.score(candidates).sort((left, right) => right.score - left.score);
    const selected = scored[0]?.name ?? decision.name;
    const patternEngine = new PatternEngine();
    const catalog = new PatternCatalog();
    const patterns = patternEngine.select(catalog.getCatalog().map((entry) => ({ id: entry.id, name: entry.name, summary: entry.description })));

    const snapshot: ArchitectureSnapshot = {
      architecture: selected,
      score: scored[0]?.score ?? decision.confidence,
      complexity: analysis.complexity,
      scalability: analysis.scalability,
      maintainability: analysis.maintainability,
      risk: analysis.risk,
      deploymentStrategy: analysis.deploymentStrategy,
      dataStrategy: analysis.dataStrategy,
      apiStrategy: analysis.apiStrategy,
      securityStrategy: analysis.securityStrategy,
      testingStrategy: analysis.testingStrategy,
      moduleBoundaries: analysis.moduleBoundaries,
      packageOrganization: analysis.packageOrganization,
      namingConvention: analysis.namingConvention,
      decisions: [decision],
      patterns: patterns.map((pattern) => pattern.name),
    };

    const knowledgePath = path.join(context.projectRoot, "knowledge");
    await fs.mkdir(knowledgePath, { recursive: true });
    await fs.writeFile(path.join(knowledgePath, "architecture.json"), JSON.stringify(snapshot, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgePath, "architecture-history.json"), JSON.stringify({ history: [snapshot] }, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgePath, "architecture-decisions.json"), JSON.stringify({ decisions: [decision] }, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgePath, "project-topology.json"), JSON.stringify({ topology: snapshot.moduleBoundaries }, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgePath, "module-map.json"), JSON.stringify({ modules: snapshot.packageOrganization }, null, 2), "utf8");

    const knowledge = new ArchitectureKnowledge();
    await knowledge.learn(context, patterns);

    context.metadata = {
      ...context.metadata,
      architecture: snapshot,
    } as typeof context.metadata & { architecture?: ArchitectureSnapshot };
  }
}
