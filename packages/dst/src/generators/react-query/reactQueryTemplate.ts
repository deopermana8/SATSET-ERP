import type { DstSpecification } from "../../types/index.js";

export const reactQueryTemplateName = "react-query";

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

function toKebabCase(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toDomainName(spec: DstSpecification): string {
  const domainName = spec.domain.name.trim();
  if (!domainName) {
    throw new Error("domain.name is required for React Query API generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive React Query domain name from domain.name \"${spec.domain.name}\"`);
  }

  return domainPascal;
}

export function toReactQueryOutputPath(spec: DstSpecification): string {
  return `apps/web/src/api/${toDomainName(spec)}Api.ts`;
}

export function toReactQueryTemplateData(spec: DstSpecification): {
  camelName: string;
  endpoint: string;
} {
  const domainName = spec.domain.name.trim();
  const camelName = toCamelCase(domainName);
  if (!camelName) {
    throw new Error(`Cannot derive React Query variable name from domain.name \"${spec.domain.name}\"`);
  }

  const endpoint = toKebabCase(domainName);
  if (!endpoint) {
    throw new Error(`Cannot derive React Query endpoint from domain.name \"${spec.domain.name}\"`);
  }

  return {
    camelName,
    endpoint
  };
}
