import type { DstSpecification } from "../../types/index.js";

export const serviceTemplateName = "service";

function toPascalCase(input: string): string {
  return input
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

export function toServiceClassName(spec: DstSpecification): string {
  const domainName = spec.domain.name.trim();
  if (!domainName) {
    throw new Error("domain.name is required for service generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive service class name from domain.name \"${spec.domain.name}\"`);
  }

  return `${domainPascal}Service`;
}

export function toServiceOutputPath(spec: DstSpecification): string {
  return `apps/api/src/services/${toServiceClassName(spec)}.ts`;
}

export function toServiceTemplateData(spec: DstSpecification): { className: string; repositoryClassName: string } {
  const domainBase = toServiceClassName(spec).replace(/Service$/, "");
  return {
    className: toServiceClassName(spec),
    repositoryClassName: `${domainBase}Repository`
  };
}
