import type { DstSpecification } from "../../types/index.js";

export const tableTemplateName = "table";

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
    throw new Error("domain.name is required for table generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive table domain name from domain.name \"${spec.domain.name}\"`);
  }

  return domainPascal;
}

export function toTableOutputPath(spec: DstSpecification): string {
  return `apps/web/src/components/${toDomainName(spec)}Table.tsx`;
}

export function toTableTemplateData(spec: DstSpecification): { domainName: string } {
  return {
    domainName: toDomainName(spec)
  };
}
