import type { MasterValidationRule, ValidationContext } from "./types.js";

export type FieldValidationResult = {
  field: string;
  errors: string[];
};

export type RecordValidationResult = {
  ok: boolean;
  fields: FieldValidationResult[];
  errors: string[];
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+62|62|0)[0-9\-\s]{7,15}$/;

function getString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}

function runRule<TRecord extends Record<string, unknown>>(
  value: unknown,
  rule: MasterValidationRule<TRecord>,
  context: ValidationContext<TRecord>,
): string | null {
  switch (rule.type) {
    case "required": {
      return isEmpty(value) ? rule.message ?? "Wajib diisi" : null;
    }
    case "min": {
      const limit = Number(rule.value ?? 0);
      const length = getString(value).length;
      return length < limit ? rule.message ?? `Minimal ${limit} karakter` : null;
    }
    case "max": {
      const limit = Number(rule.value ?? Number.MAX_SAFE_INTEGER);
      const length = getString(value).length;
      return length > limit ? rule.message ?? `Maksimal ${limit} karakter` : null;
    }
    case "regex": {
      const pattern = typeof rule.value === "string" ? new RegExp(rule.value) : (rule.value as RegExp | undefined);
      if (!pattern) {
        return null;
      }
      return pattern.test(getString(value)) ? null : rule.message ?? "Format tidak valid";
    }
    case "email": {
      if (isEmpty(value)) {
        return null;
      }
      return EMAIL_REGEX.test(getString(value)) ? null : rule.message ?? "Format email tidak valid";
    }
    case "phone": {
      if (isEmpty(value)) {
        return null;
      }
      return PHONE_REGEX.test(getString(value)) ? null : rule.message ?? "Format telepon tidak valid";
    }
    case "duplicate": {
      const duplicate = context.existingRows.some((row) => getString(row[context.fieldName]) === getString(value));
      return duplicate ? rule.message ?? "Data duplikat" : null;
    }
    case "unique": {
      const duplicate = context.existingRows.some((row) => getString(row[context.fieldName]) === getString(value));
      return duplicate ? rule.message ?? "Data harus unik" : null;
    }
    case "custom": {
      if (!rule.validator) {
        return null;
      }
      return rule.validator(value, context) ? null : rule.message ?? "Validasi kustom gagal";
    }
    default:
      return null;
  }
}

export function validateField<TRecord extends Record<string, unknown>>(
  value: unknown,
  fieldName: string,
  entity: string,
  rules: MasterValidationRule<TRecord>[],
  record: Partial<TRecord>,
  existingRows: TRecord[],
): string[] {
  const errors: string[] = [];
  const context: ValidationContext<TRecord> = {
    entity,
    fieldName,
    record,
    existingRows,
  };

  for (const rule of rules) {
    const issue = runRule(value, rule, context);
    if (issue) {
      errors.push(issue);
    }
  }

  return errors;
}

export function validateRecord<TRecord extends Record<string, unknown>>(
  entity: string,
  record: Partial<TRecord>,
  fieldRules: Record<string, MasterValidationRule<TRecord>[]>,
  existingRows: TRecord[],
): RecordValidationResult {
  const fields: FieldValidationResult[] = [];
  const errors: string[] = [];

  for (const [fieldName, rules] of Object.entries(fieldRules)) {
    const fieldErrors = validateField(record[fieldName as keyof TRecord], fieldName, entity, rules, record, existingRows);
    if (fieldErrors.length > 0) {
      fields.push({ field: fieldName, errors: fieldErrors });
      errors.push(...fieldErrors.map((message) => `${fieldName}: ${message}`));
    }
  }

  return {
    ok: errors.length === 0,
    fields,
    errors,
  };
}
