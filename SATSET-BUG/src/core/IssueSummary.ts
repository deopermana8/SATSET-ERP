export interface IssueSummary {
  total: number;
  info: number;
  warning: number;
  error: number;
  critical: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
}
