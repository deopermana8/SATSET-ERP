import fs from "node:fs";
import path from "node:path";
import type { DomainModel } from "./DomainModelGenerator.js";

export interface LayeredApiGenerateResult {
  written: string[];
  errors: string[];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function repository(name: string): string {
  return `export class ${cap(name)}Repository {
  private store: Map<string, Record<string, unknown>> = new Map();

  findAll(): Record<string, unknown>[] {
    return Array.from(this.store.values());
  }

  findById(id: string): Record<string, unknown> | undefined {
    return this.store.get(id);
  }

  create(data: Record<string, unknown>): Record<string, unknown> {
    const id = String(Date.now());
    const record = { id, ...data };
    this.store.set(id, record);
    return record;
  }

  update(id: string, data: Record<string, unknown>): Record<string, unknown> | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.store.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }
}
`;
}

function service(name: string): string {
  return `import { ${cap(name)}Repository } from "../repositories/${name}Repository.js";

export class ${cap(name)}Service {
  constructor(private readonly repo = new ${cap(name)}Repository()) {}

  getAll(): Record<string, unknown>[] {
    return this.repo.findAll();
  }

  getById(id: string): Record<string, unknown> | undefined {
    return this.repo.findById(id);
  }

  create(data: Record<string, unknown>): Record<string, unknown> {
    return this.repo.create(data);
  }

  update(id: string, data: Record<string, unknown>): Record<string, unknown> | undefined {
    return this.repo.update(id, data);
  }

  delete(id: string): boolean {
    return this.repo.delete(id);
  }
}
`;
}

function controller(name: string): string {
  return `import { Router } from "express";
import { ${cap(name)}Service } from "../services/${name}Service.js";

const router = Router();
const service = new ${cap(name)}Service();

router.get("/", (_req, res) => {
  res.json({ data: service.getAll() });
});

router.get("/:id", (req, res) => {
  const item = service.getById(req.params.id);
  if (!item) return res.status(404).json({ error: "not found" });
  return res.json(item);
});

router.post("/", (req, res) => {
  const created = service.create(req.body as Record<string, unknown>);
  res.status(201).json(created);
});

router.put("/:id", (req, res) => {
  const updated = service.update(req.params.id, req.body as Record<string, unknown>);
  if (!updated) return res.status(404).json({ error: "not found" });
  return res.json(updated);
});

router.delete("/:id", (req, res) => {
  const deleted = service.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "not found" });
  return res.status(204).send();
});

export default router;
`;
}

export class LayeredApiGenerator {
  generate(model: DomainModel, outputDir: string): LayeredApiGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const dirs = ["repositories", "services", "controllers"].map(
      (d) => path.join(outputDir, "src", d)
    );

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
        [`src/repositories/${entity.name}Repository.ts`]: repository(entity.name),
        [`src/services/${entity.name}Service.ts`]: service(entity.name),
        [`src/controllers/${entity.name}Controller.ts`]: controller(entity.name),
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
