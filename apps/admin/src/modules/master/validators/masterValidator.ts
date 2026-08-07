import type { MasterField, MasterRecord } from "../crud/types.js";

export type ValidationIssue = {
  field: string;
  message: string;
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};

export function validateMasterRecord(record: Partial<MasterRecord>, fields: MasterField[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  for (const field of fields) {
    const value = record[field.name as keyof MasterRecord];
    if (field.required && String(value ?? "").trim().length === 0) {
      issues.push({ field: field.name, message: `${field.label} wajib diisi` });
    }
  }
  return { ok: issues.length === 0, issues };
}
