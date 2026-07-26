import type { Context } from "../core/Context.js";
import { ArchitectureAnalyzer } from "./ArchitectureAnalyzer.js";

export interface ArchitectureDecision {
  id: string;
  name: string;
  confidence: number;
  rationale: string;
}

export class ArchitectureDecisionEngine {
  decide(context: Context): ArchitectureDecision {
    const analysis = new ArchitectureAnalyzer().analyze(context);
    const score = analysis.complexity === "large" ? 0.92 : analysis.complexity === "medium" ? 0.82 : 0.74;
    return {
      id: `arch-${Date.now()}`,
      name: analysis.complexity === "large" ? "Modular Monolith" : "Monolith",
      confidence: score,
      rationale: `Selected ${analysis.complexity} architecture with ${analysis.deploymentStrategy} deployment`,
    };
  }
}
