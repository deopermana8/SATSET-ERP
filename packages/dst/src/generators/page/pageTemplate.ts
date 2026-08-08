import type { DstSpecification } from "../../types/index.js";

export const pageTemplateName = "page";

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
    throw new Error("domain.name is required for page generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive page domain name from domain.name \"${spec.domain.name}\"`);
  }

  return domainPascal;
}

export function toPageOutputPath(spec: DstSpecification): string {
  return `apps/web/src/pages/${toDomainName(spec)}Page.tsx`;
}

export function toPageTemplateData(spec: DstSpecification): { domainName: string } {
  return {
    domainName: toDomainName(spec)
  };
}
