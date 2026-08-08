import type { DstSpecification } from "../../types/index.js";

export const apiTemplateName = "api";

function toPascalCase(input: string): string {
  return input
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function toDomainName(spec: DstSpecification): string {
  const domainName = spec.domain.name.trim();
  if (!domainName) {
    throw new Error("domain.name is required for API generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive API domain name from domain.name \"${spec.domain.name}\"`);
  }

  return domainPascal;
}

export function toApiOutputPath(spec: DstSpecification): string {
  return `apps/api/src/api/${toDomainName(spec)}Api.ts`;
}

export function toApiTemplateData(spec: DstSpecification): { controllerClassName: string } {
  const domain = toDomainName(spec);
  return {
    controllerClassName: `${domain}Controller`
  };
}
