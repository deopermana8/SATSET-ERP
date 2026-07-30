import fs from "node:fs";
import path from "node:path";
import type { DomainModel, DomainEntity, EntityField } from "./DomainModelGenerator.js";

export interface ZodValidationGenerateResult {
  written: string[];
  errors: string[];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function zodType(field: EntityField): string {
  if (field.primaryKey) return "z.string()";
  switch (field.type) {
    case "integer": return field.required ? "z.number().int()" : "z.number().int().optional()";
    case "float": return field.required ? "z.number()" : "z.number().optional()";
    case "boolean": return field.required ? "z.boolean()" : "z.boolean().optional()";
    case "datetime": return field.required ? "z.string().datetime()" : "z.string().datetime().optional()";
    default:
      if (field.name === "email") return field.required ? "z.string().email()" : "z.string().email().optional()";
      return field.required ? "z.string().min(1)" : "z.string().optional()";
  }
}

function schemaFile(entity: DomainEntity): string {
  const fields = entity.fields
    .filter((f) => !f.primaryKey && f.name !== "createdAt" && f.name !== "updatedAt")
    .map((f) => `  ${f.name}: ${zodType(f)},`)
    .join("\n");

  const allFields = entity.fields
    .map((f) => `  ${f.name}: ${zodType(f)},`)
    .join("\n");

  return `import { z } from "zod";

// Schema for create/update (excludes auto-generated fields)
export const ${entity.name}Schema = z.object({
${fields}
});

// Full schema including all fields
export const ${entity.name}FullSchema = z.object({
${allFields}
});

export type ${cap(entity.name)}Input = z.infer<typeof ${entity.name}Schema>;
export type ${cap(entity.name)} = z.infer<typeof ${entity.name}FullSchema>;

export function validate${cap(entity.name)}(data: unknown): ${cap(entity.name)}Input {
  return ${entity.name}Schema.parse(data);
}

export function safeParse${cap(entity.name)}(data: unknown) {
  return ${entity.name}Schema.safeParse(data);
}
`;
}

function backendMiddleware(entity: DomainEntity): string {
  return `import type { Request, Response, NextFunction } from "express";
import { safeParse${cap(entity.name)} } from "../schemas/${entity.name}Schema.js";

export function validate${cap(entity.name)}Body(req: Request, res: Response, next: NextFunction): void {
  const result = safeParse${cap(entity.name)}(req.body);
  if (!result.success) {
    res.status(400).json({ error: "validation failed", issues: result.error.issues });
    return;
  }
  req.body = result.data;
  next();
}
`;
}

export class ZodValidationGenerator {
  generate(model: DomainModel, outputDir: string): ZodValidationGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const dirs = [
      path.join(outputDir, "src", "schemas"),
      path.join(outputDir, "src", "validation"),
    ];

    for (const dir of dirs) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        errors.push(`failed to create ${dir}: ${err instanceof Error ? err.message : String(err)}`);
        return { written, errors };
      }
    }

    for (const entity of model.entities) {
      const files: Record<string, string> = {
        [`src/schemas/${entity.name}Schema.ts`]: schemaFile(entity),
        [`src/validation/${entity.name}Middleware.ts`]: backendMiddleware(entity),
      };

      for (const [filePath, content] of Object.entries(files)) {
        const target = path.join(outputDir, filePath);
        try {
          fs.writeFileSync(target, content, "utf8");
          written.push(target);
        } catch (err) {
          errors.push(`failed to write ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    return { written, errors };
  }
}
