import type { DstSpecification } from "../../types/index.js";

export const formTemplateName = "form";

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
    throw new Error("domain.name is required for form generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive form domain name from domain.name \"${spec.domain.name}\"`);
  }

  return domainPascal;
}

export function toFormOutputPath(spec: DstSpecification): string {
  return `apps/web/src/components/${toDomainName(spec)}Form.tsx`;
}

export function toFormTemplateData(spec: DstSpecification): { domainName: string } {
  return {
    domainName: toDomainName(spec)
  };
}
