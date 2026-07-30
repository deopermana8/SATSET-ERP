import fs from "node:fs";
import path from "node:path";
import type { DomainModel, DomainEntity, EntityField } from "./DomainModelGenerator.js";

export interface DtoGenerateResult {
  written: string[];
  errors: string[];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function tsType(field: EntityField): string {
  switch (field.type) {
    case "integer":
    case "float": return field.required ? "number" : "number | undefined";
    case "boolean": return field.required ? "boolean" : "boolean | undefined";
    case "datetime": return field.required ? "string" : "string | undefined";
    default: return field.required ? "string" : "string | undefined";
  }
}

function dtoFile(entity: DomainEntity): string {
  const inputFields = entity.fields
    .filter((f) => !f.primaryKey && f.name !== "createdAt" && f.name !== "updatedAt")
    .map((f) => `  ${f.name}${f.required ? "" : "?"}: ${tsType(f)};`)
    .join("\n");

  const fullFields = entity.fields
    .map((f) => `  ${f.name}: ${tsType(f)};`)
    .join("\n");

  const updateFields = entity.fields
    .filter((f) => !f.primaryKey && f.name !== "createdAt" && f.name !== "updatedAt")
    .map((f) => `  ${f.name}?: ${tsType(f)};`)
    .join("\n");

  return `// DTOs for ${entity.name}

export interface Create${cap(entity.name)}Dto {
${inputFields}
}

export interface Update${cap(entity.name)}Dto {
${updateFields}
}

export interface ${cap(entity.name)}Dto {
${fullFields}
}

export interface Paginated${cap(entity.name)}Dto {
  data: ${cap(entity.name)}Dto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ${cap(entity.name)}QueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: ${entity.fields.filter((f) => !f.primaryKey).length > 0 ? entity.fields.filter((f) => !f.primaryKey).map((f) => `"${f.name}"`).join(" | ") : "string"};
  sortOrder?: "asc" | "desc";
}
`;
}

export class DtoGenerator {
  generate(model: DomainModel, outputDir: string): DtoGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const dir = path.join(outputDir, "src", "dto");
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      errors.push(`failed to create dto dir: ${err instanceof Error ? err.message : String(err)}`);
      return { written, errors };
    }

    for (const entity of model.entities) {
      const target = path.join(dir, `${entity.name}.dto.ts`);
      try {
        fs.writeFileSync(target, dtoFile(entity), "utf8");
        written.push(target);
      } catch (err) {
        errors.push(`failed to write ${entity.name}.dto.ts: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { written, errors };
  }
}
