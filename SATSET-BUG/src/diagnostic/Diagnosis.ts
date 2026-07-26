import type { FixSuggestion } from "../core/FixSuggestion.js";

export interface Diagnosis {
  id: string;
  title: string;
  rootCause: string;
  confidence: number; // 0-100
  description: string;
  affectedFiles: string[];
  recommendedFixes: Array<{
    id: string;
    title: string;
    description: string;
    risk: "low" | "medium" | "high";
    automatic: boolean;
    steps: string[];
  }>;
  estimatedRepairTime: number | null; // minutes
  automaticFixAvailable: boolean;
}

export function mapFixSuggestion(f: FixSuggestion) {
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    risk: f.risk,
    automatic: f.automatic,
    steps: f.steps,
  };
}
