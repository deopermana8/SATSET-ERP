import type { MasterFilterCondition } from "./types.js";

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function toNumberValue(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function toDateMs(value: unknown): number {
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? Number.NaN : date.getTime();
}

function evaluateCondition(rowValue: unknown, condition: MasterFilterCondition): boolean {
  const value = condition.value;
  const left = toStringValue(rowValue).toLowerCase();

  switch (condition.operator) {
    case "equals":
      return left === toStringValue(value).toLowerCase();
    case "notEquals":
      return left !== toStringValue(value).toLowerCase();
    case "contains":
      return left.includes(toStringValue(value).toLowerCase());
    case "startsWith":
      return left.startsWith(toStringValue(value).toLowerCase());
    case "endsWith":
      return left.endsWith(toStringValue(value).toLowerCase());
    case "greaterThan":
      return toNumberValue(rowValue) > toNumberValue(value);
    case "lessThan":
      return toNumberValue(rowValue) < toNumberValue(value);
    case "between": {
      if (!Array.isArray(value) || value.length < 2) {
        return true;
      }
      const current = toNumberValue(rowValue);
      const min = toNumberValue(value[0]);
      const max = toNumberValue(value[1]);
      return current >= min && current <= max;
    }
    case "empty":
      return left.trim().length === 0;
    case "notEmpty":
      return left.trim().length > 0;
    case "dateRange": {
      if (!Array.isArray(value) || value.length < 2) {
        return true;
      }
      const current = toDateMs(rowValue);
      const start = toDateMs(value[0]);
      const end = toDateMs(value[1]);
      return current >= start && current <= end;
    }
    case "multiSelect": {
      if (!Array.isArray(value)) {
        return true;
      }
      const normalized = value.map((entry) => toStringValue(entry).toLowerCase());
      return normalized.includes(left);
    }
    default:
      return true;
  }
}

export function applyFilterConditions<TRecord extends Record<string, unknown>>(
  rows: TRecord[],
  conditions: MasterFilterCondition[] = [],
): TRecord[] {
  if (conditions.length === 0) {
    return rows;
  }
  return rows.filter((row) => {
    for (const condition of conditions) {
      if (!evaluateCondition(row[condition.field], condition)) {
        return false;
      }
    }
    return true;
  });
}
