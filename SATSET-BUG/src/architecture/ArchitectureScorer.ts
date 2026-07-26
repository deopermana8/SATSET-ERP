export interface ScoredArchitecture {
  name: string;
  score: number;
  rationale: string;
}

export class ArchitectureScorer {
  score(candidates: Array<{ name: string; rationale: string; complexity: string }>): ScoredArchitecture[] {
    return candidates.map((candidate) => ({
      name: candidate.name,
      score: candidate.complexity === "large" ? 0.9 : candidate.complexity === "medium" ? 0.8 : 0.7,
      rationale: candidate.rationale,
    }));
  }
}
