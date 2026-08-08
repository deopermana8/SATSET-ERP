import type { DstSpecification } from "../../types/index.js";

export const barrelTemplateName = "barrel";

export interface BarrelTarget {
  path: string;
  exports: string[];
}

function toPascalCase(input: string): string {
  return input
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function toCamelCase(input: string): string {
  const pascal = toPascalCase(input);
  return pascal ? `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}` : "";
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
    throw new Error("domain.name is required for barrel generation");
  }

  const domainPascal = toPascalCase(domainName);
  if (!domainPascal) {
    throw new Error(`Cannot derive barrel domain name from domain.name \"${spec.domain.name}\"`);
  }

  return domainPascal;
}

export function toBarrelTargets(spec: DstSpecification): BarrelTarget[] {
  const domain = toDomainName(spec);
  const domainKebab = toKebabCase(spec.domain.name);
  const domainCamel = toCamelCase(spec.domain.name);

  if (!domainKebab || !domainCamel) {
    throw new Error(`Cannot derive barrel path segments from domain.name \"${spec.domain.name}\"`);
  }

  return [
    {
      path: "apps/api/src/controllers/index.ts",
      exports: [`./${domain}Controller`]
    },
    {
      path: "apps/api/src/services/index.ts",
      exports: [`./${domain}Service`]
    },
    {
      path: "apps/api/src/repositories/index.ts",
      exports: [`./${domain}Repository`]
    },
    {
      path: "apps/api/src/dto/index.ts",
      exports: [`./${domain}Dto`]
    },
    {
      path: "apps/api/src/api/index.ts",
      exports: [`./${domain}Api`]
    },
    {
      path: "apps/web/src/hooks/index.ts",
      exports: [`./use${domain}`]
    },
    {
      path: "apps/web/src/components/index.ts",
      exports: [`./${domain}Table`, `./${domain}Form`]
    },
    {
      path: "apps/web/src/pages/index.ts",
      exports: [`./${domain}Page`]
    },
    {
      path: "apps/web/src/modules/index.ts",
      exports: [`./${domainKebab}`]
    }
  ];
}

export function toBarrelTemplateData(target: BarrelTarget): { exports: string[] } {
  return {
    exports: target.exports
  };
}
