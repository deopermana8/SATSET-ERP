export interface FixSuggestion {
  id: string;
  title: string;
  description: string;
  risk: "low" | "medium" | "high";
  automatic: boolean;
  steps: string[];
}
