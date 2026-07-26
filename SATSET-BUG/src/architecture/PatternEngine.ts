import type { ArchitecturePattern } from "./ArchitectureKnowledge.js";

export class PatternEngine {
  select(patterns: ArchitecturePattern[]): ArchitecturePattern[] {
    return patterns.slice(0, 3);
  }
}
