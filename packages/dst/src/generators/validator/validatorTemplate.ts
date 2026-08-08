import type { DstFieldSpec, DstSpecification } from "../../types/index.js";

export const validatorTemplateName = "validator";

function toPascalCase(input: string): string {
  return input
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

export function toValidatorClassName(spec: DstSpecification): string {
  const domainName = spec.domain.name.trim();
  if (!domainName) {
    throw new Error("domain.name is required for validator generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive validator class name from domain.name \"${spec.domain.name}\"`);
  }

  return `${domainPascal}Validator`;
}

export function toValidatorOutputPath(spec: DstSpecification): string {
  return `apps/api/src/validators/${toValidatorClassName(spec)}.ts`;
}

export function toValidatorTemplateData(spec: DstSpecification): {
  className: string;
  fields: Array<{ name: string; type: string; required: boolean }>;
} {
  return {
    className: toValidatorClassName(spec),
    fields: spec.fields.map((field: DstFieldSpec) => ({
      name: field.name,
      type: field.type,
      required: field.required
    }))
  };
}
