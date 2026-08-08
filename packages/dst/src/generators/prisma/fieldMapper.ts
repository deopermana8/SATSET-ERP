import type { DstFieldSpec } from "../../types/index.js";

const fieldTypeMap: Record<string, string> = {
  string: "String",
  text: "String",
  email: "String",
  number: "Int",
  decimal: "Decimal",
  boolean: "Boolean",
  date: "DateTime",
  datetime: "DateTime",
  json: "Json"
};

function escapePrismaString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
}

function mapDefaultValue(value: DstFieldSpec["default"]): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    // Allow Prisma function-like defaults such as now() and cuid().
    if (/^[a-zA-Z_][a-zA-Z0-9_]*\(\)$/.test(trimmed)) {
      return trimmed;
    }
    return `\"${escapePrismaString(trimmed)}\"`;
  }

  throw new Error("Unsupported default value type");
}

export function mapFieldType(type: string): string {
  const mapped = fieldTypeMap[type.trim().toLowerCase()];
  if (!mapped) {
    throw new Error(`Unsupported DST field type: \"${type}\"`);
  }
  return mapped;
}

export function mapFieldToPrismaLine(field: DstFieldSpec): string {
  const prismaType = mapFieldType(field.type);
  const optionalToken = field.required ? "" : "?";
  const attributes: string[] = [];

  if (field.unique) {
    attributes.push("@unique");
  }

  if (field.default !== undefined) {
    attributes.push(`@default(${mapDefaultValue(field.default)})`);
  }

  const attrs = attributes.length > 0 ? ` ${attributes.join(" ")}` : "";
  return `  ${field.name} ${prismaType}${optionalToken}${attrs}`;
}
