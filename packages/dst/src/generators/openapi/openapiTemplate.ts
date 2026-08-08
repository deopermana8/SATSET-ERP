import type { DstSpecification } from "../../types/index.js";

export const openapiTemplateName = "openapi";

function toPascalCase(input: string): string {
  return input
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
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
    throw new Error("domain.name is required for OpenAPI generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive OpenAPI domain name from domain.name \"${spec.domain.name}\"`);
  }

  return domainPascal;
}

function toDomainPath(spec: DstSpecification): string {
  const domainName = spec.domain.name.trim();
  const domainPath = toKebabCase(domainName);
  if (!domainPath) {
    throw new Error(`Cannot derive OpenAPI domain path from domain.name \"${spec.domain.name}\"`);
  }

  return domainPath;
}

export function toOpenApiOutputPath(spec: DstSpecification): string {
  return `apps/api/src/openapi/${toDomainName(spec)}OpenApi.ts`;
}

export function toOpenApiTemplateData(spec: DstSpecification): {
  domainName: string;
  domainPath: string;
  openApiObjectName: string;
} {
  const domainName = toDomainName(spec);
  return {
    domainName,
    domainPath: toDomainPath(spec),
    openApiObjectName: `${domainName}OpenAPI`
  };
}
