export interface EvolutionProposal {
  id: string;
  kind: "prompt-template" | "generator" | "repair-strategy" | "benchmark-threshold" | "knowledge-graph";
  summary: string;
  details: string;
  confidence: number;
  accepted: boolean;
}

export interface EvolutionRecord {
  id: string;
  project: string;
  summary: string;
  proposals: EvolutionProposal[];
  timestamp: string;
}

export interface ConfidencePoint {
  timestamp: string;
  score: number;
  reason: string;
}

export interface SelfEvolutionSnapshot {
  evolution: EvolutionRecord[];
  improvements: EvolutionProposal[];
  confidenceHistory: ConfidencePoint[];
  learning: { repeatedMistakes: string[]; acceptedImprovements: number; rejectedImprovements: number };
}
