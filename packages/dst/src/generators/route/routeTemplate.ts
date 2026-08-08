import type { DstSpecification } from "../../types/index.js";

export const routeTemplateName = "route";

function toKebabCase(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toConstCase(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function getDomainSegment(spec: DstSpecification): string {
  const domainName = spec.domain.name.trim();
  if (!domainName) {
    throw new Error("domain.name is required for route generation");
  }

  const segment = toKebabCase(domainName);
  if (!segment) {
    throw new Error(`Cannot derive route file/path segment from domain.name \"${spec.domain.name}\"`);
  }

  return segment;
}

export function toRouteFileName(spec: DstSpecification): string {
  return `${getDomainSegment(spec)}.routes.ts`;
}

export function toRouteOutputPath(spec: DstSpecification): string {
  return `apps/api/src/routes/${toRouteFileName(spec)}`;
}

export function toRouteTemplateData(spec: DstSpecification): { routeConstName: string; domainPath: string } {
  const segment = getDomainSegment(spec);
  const constPrefix = toConstCase(spec.domain.name);
  if (!constPrefix) {
    throw new Error(`Cannot derive route const name from domain.name \"${spec.domain.name}\"`);
  }

  return {
    routeConstName: `${constPrefix}_ROUTES`,
    domainPath: segment
  };
}
