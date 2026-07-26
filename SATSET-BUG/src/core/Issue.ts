import type { Severity } from "./Severity.js";
import type { Evidence } from "./Evidence.js";
import type { FixSuggestion } from "./FixSuggestion.js";

export interface IssueSuggestion {
  title?: string;
  description?: string;
}

export interface Issue {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  suggestion?: string | IssueSuggestion;
  reference?: string;
  evidence?: Evidence[];
  fixes?: FixSuggestion[];
  ruleId?: string;
}
