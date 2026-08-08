import type { DstFieldSpec, DstSpecification } from "../../types/index.js";

export const dtoTemplateName = "dto";

function toPascalCase(input: string): string {
  return input
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function mapFieldTypeToTs(type: string): string {
  const key = type.trim().toLowerCase();

  const map: Record<string, string> = {
    string: "string",
    text: "string",
    email: "string",
    number: "number",
    decimal: "number",
    boolean: "boolean",
    date: "string",
    datetime: "string",
    json: "unknown"
  };

  const mapped = map[key];
  if (!mapped) {
    throw new Error(`Unsupported DST field type for DTO: \"${type}\"`);
  }

  return mapped;
}

export function toDtoDomainName(spec: DstSpecification): string {
  const raw = spec.domain.name.trim();
  if (!raw) {
    throw new Error("domain.name is required for dto generation");
  }

  const domainName = toPascalCase(raw);
  if (!domainName) {
    throw new Error(`Cannot derive DTO domain name from domain.name \"${spec.domain.name}\"`);
  }

  return domainName;
}

export function toDtoOutputPath(spec: DstSpecification): string {
  return `apps/api/src/dto/${toDtoDomainName(spec)}Dto.ts`;
}

interface DtoFieldTemplate {
  name: string;
  type: string;
  optional: boolean;
}

function toCreateDtoField(field: DstFieldSpec): DtoFieldTemplate {
  return {
    name: field.name,
    type: mapFieldTypeToTs(field.type),
    optional: !field.required
  };
}

function toUpdateDtoField(field: DstFieldSpec): DtoFieldTemplate {
  return {
    name: field.name,
    type: mapFieldTypeToTs(field.type),
    optional: true
  };
}

export function toDtoTemplateData(spec: DstSpecification): {
  domainName: string;
  createFields: DtoFieldTemplate[];
  updateFields: DtoFieldTemplate[];
} {
  return {
    domainName: toDtoDomainName(spec),
    createFields: spec.fields.map(toCreateDtoField),
    updateFields: spec.fields.map(toUpdateDtoField)
  };
}
