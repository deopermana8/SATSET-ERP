import { parseDocument } from "yaml";

import type {
  DstCustomerSpec,
  DstDefaultValue,
  DstFieldSpec,
  DstGeneratorConfig,
  DstValidationIssue,
  DstValidationResult,
  DstVersion
} from "../types/index.js";

const SUPPORTED_VERSION: DstVersion = "1.0";
const RESERVED_FIELD_NAMES = new Set(["id", "createdAt", "updatedAt", "deletedAt"]);
const GENERATOR_CONFIG_KEYS: Array<keyof DstGeneratorConfig> = [
  "prisma",
  "route",
  "repository",
  "service",
  "controller",
  "dto",
  "validator",
  "api",
  "openapi"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pushIssue(issues: DstValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

function normalizeField(raw: unknown, index: number, issues: DstValidationIssue[]): DstFieldSpec | null {
  const path = `fields[${index}]`;
  if (!isRecord(raw)) {
    pushIssue(issues, path, "must be an object");
    return null;
  }

  const name = raw.name;
  const type = raw.type;
  const required = raw.required;
  const unique = raw.unique;
  const defaultValue = raw.default;
  const description = raw.description;

  if (typeof name !== "string" || !name.trim()) {
    pushIssue(issues, `${path}.name`, "must be a non-empty string");
  } else {
    const normalizedName = name.trim();
    if (RESERVED_FIELD_NAMES.has(normalizedName)) {
      pushIssue(issues, `${path}.name`, `Field "${normalizedName}" is reserved by DST.`);
    }
  }

  if (typeof type !== "string" || !type.trim()) {
    pushIssue(issues, `${path}.type`, "must be a non-empty string");
  }

  if (typeof required !== "boolean") {
    pushIssue(issues, `${path}.required`, "must be a boolean");
  }

  if (unique !== undefined && typeof unique !== "boolean") {
    pushIssue(issues, `${path}.unique`, "must be a boolean when provided");
  }

  if (
    defaultValue !== undefined
    && defaultValue !== null
    && typeof defaultValue !== "string"
    && typeof defaultValue !== "number"
    && typeof defaultValue !== "boolean"
  ) {
    pushIssue(issues, `${path}.default`, "must be string, number, boolean, or null when provided");
  }

  if (description !== undefined && typeof description !== "string") {
    pushIssue(issues, `${path}.description`, "must be a string when provided");
  }

  if (
    (typeof name !== "string" || !name.trim()) ||
    (typeof type !== "string" || !type.trim()) ||
    typeof required !== "boolean" ||
    (unique !== undefined && typeof unique !== "boolean") ||
    (
      defaultValue !== undefined
      && defaultValue !== null
      && typeof defaultValue !== "string"
      && typeof defaultValue !== "number"
      && typeof defaultValue !== "boolean"
    ) ||
    (description !== undefined && typeof description !== "string")
  ) {
    return null;
  }

  return {
    name: name.trim(),
    type: type.trim(),
    required,
    unique: typeof unique === "boolean" ? unique : undefined,
    default: defaultValue as DstDefaultValue | undefined,
    description: typeof description === "string" ? description.trim() : undefined
  };
}

export function validateCustomerSpec(spec: unknown): DstValidationResult {
  const issues: DstValidationIssue[] = [];

  if (!isRecord(spec)) {
    pushIssue(issues, "$", "root must be an object");
    return { valid: false, issues };
  }

  const version = spec.version;
  if (version !== SUPPORTED_VERSION) {
    pushIssue(issues, "version", `must be \"${SUPPORTED_VERSION}\"`);
  }

  if (spec.softDelete !== undefined && typeof spec.softDelete !== "boolean") {
    pushIssue(issues, "softDelete", "must be a boolean when provided");
  }

  const generators = spec.generators;
  if (generators !== undefined) {
    if (!isRecord(generators)) {
      pushIssue(issues, "generators", "must be an object when provided");
    } else {
      for (const key of GENERATOR_CONFIG_KEYS) {
        const value = generators[key];
        if (value !== undefined && typeof value !== "boolean") {
          pushIssue(issues, `generators.${key}`, "must be a boolean when provided");
        }
      }
    }
  }

  const domain = spec.domain;
  if (!isRecord(domain)) {
    pushIssue(issues, "domain", "must be an object");
  } else {
    if (typeof domain.name !== "string" || !domain.name.trim()) {
      pushIssue(issues, "domain.name", "must be a non-empty string");
    }
    if (domain.description !== undefined && typeof domain.description !== "string") {
      pushIssue(issues, "domain.description", "must be a string when provided");
    }
  }

  const fields = spec.fields;
  if (!Array.isArray(fields) || fields.length === 0) {
    pushIssue(issues, "fields", "must be a non-empty array");
  } else {
    fields.forEach((field, index) => {
      normalizeField(field, index, issues);
    });
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

export function parseCustomerSpecYaml(source: string): DstCustomerSpec {
  const doc = parseDocument(source);

  if (doc.errors.length > 0) {
    const details = doc.errors.map((error) => error.message).join("; ");
    throw new Error(`Invalid YAML: ${details}`);
  }

  const spec = doc.toJS();
  const result = validateCustomerSpec(spec);

  if (!result.valid) {
    const details = result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Invalid DST specification: ${details}`);
  }

  const typed = spec as {
    version: DstVersion;
    domain: { name: string; description?: string };
    fields: DstFieldSpec[];
    softDelete?: boolean;
    generators?: DstGeneratorConfig;
  };

  let parsedGenerators: DstGeneratorConfig | undefined;
  if (typed.generators && isRecord(typed.generators)) {
    parsedGenerators = {};
    for (const key of GENERATOR_CONFIG_KEYS) {
      const value = typed.generators[key];
      if (typeof value === "boolean") {
        parsedGenerators[key] = value;
      }
    }
  }

  return {
    version: typed.version,
    domain: {
      name: typed.domain.name.trim(),
      description: typed.domain.description?.trim()
    },
    softDelete: typeof typed.softDelete === "boolean" ? typed.softDelete : undefined,
    generators: parsedGenerators,
    fields: typed.fields.map((field) => ({
      name: field.name.trim(),
      type: field.type.trim(),
      required: field.required,
      unique: field.unique,
      default: field.default,
      description: field.description?.trim()
    }))
  };
}
