import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { BenchmarkEngine } from "../benchmark/BenchmarkEngine.js";
import { KnowledgeGraphEngine } from "../doctor/KnowledgeGraphEngine.js";
import type { EvolutionProposal, EvolutionRecord, ConfidencePoint, SelfEvolutionSnapshot } from "./SelfEvolutionTypes.js";

export class SelfEvolutionEngine implements IEngine {
  public readonly name = "SelfEvolutionEngine";

  async run(context: Context): Promise<void> {
    const previousProjects = await this.inspectPreviousProjects(context.projectRoot);
    const repeatedMistakes = this.detectRepeatedMistakes(previousProjects);
    const proposals = this.generateProposals(repeatedMistakes, context.projectName);
    const accepted = proposals.filter((proposal) => proposal.confidence >= 0.7);
    const rejected = proposals.filter((proposal) => proposal.confidence < 0.7);

    const evolutionRecord: EvolutionRecord = {
      id: `evolution-${Date.now()}`,
      project: context.projectName,
      summary: `Learned from ${previousProjects.length} previous projects`,
      proposals,
      timestamp: new Date().toISOString(),
    };

    const confidenceHistory: ConfidencePoint[] = [
      { timestamp: new Date().toISOString(), score: accepted.length / Math.max(1, proposals.length), reason: "proposal acceptance rate" },
    ];

    const snapshot: SelfEvolutionSnapshot = {
      evolution: [evolutionRecord],
      improvements: accepted,
      confidenceHistory,
      learning: {
        repeatedMistakes,
        acceptedImprovements: accepted.length,
        rejectedImprovements: rejected.length,
      },
    };

    const knowledgePath = path.join(context.projectRoot, "knowledge");
    await fs.mkdir(knowledgePath, { recursive: true });
    await fs.writeFile(path.join(knowledgePath, "evolution.json"), JSON.stringify(snapshot, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgePath, "improvements.json"), JSON.stringify({ improvements: accepted }, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgePath, "confidence-history.json"), JSON.stringify({ history: confidenceHistory }, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgePath, "self-learning.json"), JSON.stringify(snapshot.learning, null, 2), "utf8");

    const benchmarkEngine = new BenchmarkEngine();
    await benchmarkEngine.run(context);

    const knowledgeGraphEngine = new KnowledgeGraphEngine();
    await knowledgeGraphEngine.run(context);

    context.metadata = {
      ...context.metadata,
      selfEvolution: snapshot,
    } as typeof context.metadata & { selfEvolution?: SelfEvolutionSnapshot };
  }

  private async inspectPreviousProjects(root: string): Promise<string[]> {
    const knowledgePath = path.join(root, "knowledge");
    try {
      const entries = await fs.readdir(knowledgePath);
      return entries.filter((entry) => entry.endsWith(".json"));
    } catch {
      return [];
    }
  }

  private detectRepeatedMistakes(previousProjects: string[]): string[] {
    if (previousProjects.length === 0) {
      return ["missing-validation"];
    }
    return previousProjects.slice(0, 3);
  }

  private generateProposals(repeatedMistakes: string[], projectName: string): EvolutionProposal[] {
    return repeatedMistakes.map((mistake, index) => ({
      id: `proposal-${index + 1}`,
      kind: index % 2 === 0 ? "repair-strategy" : "benchmark-threshold",
      summary: `Improve ${projectName} against ${mistake}`,
      details: `Propose a patch for ${mistake} without modifying production code directly`,
      confidence: 0.72 + index * 0.05,
      accepted: false,
    }));
  }
}
