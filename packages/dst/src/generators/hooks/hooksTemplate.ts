import type { DstSpecification } from "../../types/index.js";

export const hooksTemplateName = "hooks";

function toPascalCase(input: string): string {
  return input
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function toCamelCase(input: string): string {
  const pascal = toPascalCase(input);
  return pascal ? `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}` : "";
}

function toDomainName(spec: DstSpecification): string {
  const domainName = spec.domain.name.trim();
  if (!domainName) {
    throw new Error("domain.name is required for hooks generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive hooks domain name from domain.name \"${spec.domain.name}\"`);
  }

  return domainPascal;
}

export function toHooksOutputPath(spec: DstSpecification): string {
  return `apps/web/src/hooks/use${toDomainName(spec)}.ts`;
}

export function toHooksTemplateData(spec: DstSpecification): {
  domainName: string;
  camelName: string;
} {
  const domainName = toDomainName(spec);
  const camelName = toCamelCase(spec.domain.name);

  if (!camelName) {
    throw new Error(`Cannot derive hooks API variable name from domain.name \"${spec.domain.name}\"`);
  }

  return {
    domainName,
    camelName
  };
}
