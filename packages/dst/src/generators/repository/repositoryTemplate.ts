import type { DstSpecification } from "../../types/index.js";

export const repositoryTemplateName = "repository";

function toPascalCase(input: string): string {
  return input
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

export function toRepositoryClassName(spec: DstSpecification): string {
  const domainName = spec.domain.name.trim();
  if (!domainName) {
    throw new Error("domain.name is required for repository generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive repository class name from domain.name \"${spec.domain.name}\"`);
  }

  return `${domainPascal}Repository`;
}

export function toRepositoryOutputPath(spec: DstSpecification): string {
  return `apps/api/src/repositories/${toRepositoryClassName(spec)}.ts`;
}

export function toRepositoryTemplateData(spec: DstSpecification): { className: string } {
  return {
    className: toRepositoryClassName(spec)
  };
}
