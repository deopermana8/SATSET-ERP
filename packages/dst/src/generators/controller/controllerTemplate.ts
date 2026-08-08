import type { DstSpecification } from "../../types/index.js";

export const controllerTemplateName = "controller";

function toPascalCase(input: string): string {
  return input
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

export function toControllerClassName(spec: DstSpecification): string {
  const domainName = spec.domain.name.trim();
  if (!domainName) {
    throw new Error("domain.name is required for controller generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive controller class name from domain.name \"${spec.domain.name}\"`);
  }

  return `${domainPascal}Controller`;
}

export function toControllerOutputPath(spec: DstSpecification): string {
  return `apps/api/src/controllers/${toControllerClassName(spec)}.ts`;
}

export function toControllerTemplateData(spec: DstSpecification): { className: string; serviceClassName: string } {
  const domainBase = toControllerClassName(spec).replace(/Controller$/, "");
  return {
    className: toControllerClassName(spec),
    serviceClassName: `${domainBase}Service`
  };
}
