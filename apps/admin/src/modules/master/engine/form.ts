import type { MasterFieldConfig } from "./types.js";

export type FormValues = Record<string, unknown>;

function defaultByType<TRecord extends Record<string, unknown>>(field: MasterFieldConfig<TRecord>): unknown {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  switch (field.input) {
    case "checkbox":
    case "switch":
      return false;
    case "multiselect":
      return [];
    case "number":
    case "currency":
      return 0;
    default:
      return "";
  }
}

export function buildInitialFormValues<TRecord extends Record<string, unknown>>(fields: MasterFieldConfig<TRecord>[]): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    values[field.name] = defaultByType(field);
  }
  return values;
}

export function normalizeFormValues<TRecord extends Record<string, unknown>>(values: FormValues, fields: MasterFieldConfig<TRecord>[]): FormValues {
  const normalized: FormValues = {};
  for (const field of fields) {
    const value = values[field.name];
    switch (field.input) {
      case "number":
      case "currency":
        normalized[field.name] = typeof value === "number" ? value : Number(value || 0);
        break;
      case "checkbox":
      case "switch":
        normalized[field.name] = Boolean(value);
        break;
      case "multiselect":
        normalized[field.name] = Array.isArray(value) ? value : [];
        break;
      case "date":
      case "datetime":
        normalized[field.name] = value ? String(value) : "";
        break;
      default:
        normalized[field.name] = value ?? "";
        break;
    }
  }
  return normalized;
}
