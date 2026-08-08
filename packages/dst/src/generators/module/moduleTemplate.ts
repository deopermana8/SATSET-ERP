import type { DstSpecification } from "../../types/index.js";

export const moduleTemplateName = "module";

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
    throw new Error("domain.name is required for module generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive module domain name from domain.name \"${spec.domain.name}\"`);
  }

  return domainPascal;
}

function toModuleSegment(spec: DstSpecification): string {
  const segment = toKebabCase(spec.domain.name);
  if (!segment) {
    throw new Error(`Cannot derive module segment from domain.name \"${spec.domain.name}\"`);
  }

  return segment;
}

export function toModuleOutputPath(spec: DstSpecification): string {
  return `apps/web/src/modules/${toModuleSegment(spec)}/index.ts`;
}

export function toModuleTemplateData(spec: DstSpecification): { domainName: string } {
  return {
    domainName: toDomainName(spec)
  };
}
