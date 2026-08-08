import type { DstSpecification } from "../../types/index.js";

import type { GeneratedFile } from "../generatedFile.js";
import { mapFieldToPrismaLine } from "./fieldMapper.js";

function toPascalCase(input: string): string {
  return input
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function toFileSegment(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function assertNoReservedFieldName(fieldName: string): void {
  const reserved = new Set(["id", "createdAt", "updatedAt", "deletedAt"]);
  if (reserved.has(fieldName)) {
    throw new Error(`Field name \"${fieldName}\" is reserved by Prisma generator`);
  }
}

export function generatePrismaModel(spec: DstSpecification): GeneratedFile {
  const domainName = spec.domain.name.trim();
  if (!domainName) {
    throw new Error("domain.name is required for Prisma generation");
  }

  const modelName = toPascalCase(domainName);
  if (!modelName) {
    throw new Error(`Cannot derive Prisma model name from domain.name \"${spec.domain.name}\"`);
  }

  const fileSegment = toFileSegment(domainName);
  if (!fileSegment) {
    throw new Error(`Cannot derive output file name from domain.name \"${spec.domain.name}\"`);
  }

  const bodyLines = spec.fields.map((field) => {
    assertNoReservedFieldName(field.name);
    return mapFieldToPrismaLine(field);
  });

  const footerLines = [
    "  id String @id @default(cuid())",
    "  createdAt DateTime @default(now())",
    "  updatedAt DateTime @updatedAt"
  ];

  if (spec.softDelete === true) {
    footerLines.push("  deletedAt DateTime?");
  }

  const modelSource = [
    `model ${modelName} {`,
    ...bodyLines,
    ...footerLines,
    "}",
    ""
  ].join("\n");

  return {
    path: `apps/api/prisma/generated/${fileSegment}.prisma`,
    content: modelSource
  };
}
