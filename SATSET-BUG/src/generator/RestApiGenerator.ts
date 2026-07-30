import fs from "node:fs";
import path from "node:path";
import type { ExecutionPlan } from "../ai/ModulePlanner.js";

export interface ApiGenerateResult {
  written: string[];
  errors: string[];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function routeFile(module: string): string {
  const cap = capitalize(module);
  return `import { Router } from "express";

const router = Router();

// GET all ${module}s
router.get("/", (_req, res) => {
  res.json({ data: [], total: 0 });
});

// GET ${module} by id
router.get("/:id", (req, res) => {
  res.json({ id: req.params.id });
});

// POST create ${module}
router.post("/", (req, res) => {
  res.status(201).json({ id: "new-id", ...req.body });
});

// PUT update ${module}
router.put("/:id", (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

// DELETE ${module}
router.delete("/:id", (req, res) => {
  res.status(204).send();
});

export default router;
`;
}

function indexFile(modules: string[]): string {
  const imports = modules.map((m) => `import ${m}Router from "./${m}.js";`).join("\n");
  const uses = modules.map((m) => `app.use("/api/${m}s", ${m}Router);`).join("\n");
  return `import express from "express";
${imports}

const app = express();
app.use(express.json());

${uses}

export default app;
`;
}

export class RestApiGenerator {
  generate(plan: ExecutionPlan, outputDir: string): ApiGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const modules = plan.modules
      .filter((m) => !["auth", "database", "dashboard", "report", "notification"].includes(m.name))
      .map((m) => m.name);

    const routesDir = path.join(outputDir, "src", "routes");

    try {
      fs.mkdirSync(routesDir, { recursive: true });
    } catch (err) {
      errors.push(`failed to create routes directory: ${err instanceof Error ? err.message : String(err)}`);
      return { written, errors };
    }

    for (const module of modules) {
      const target = path.join(routesDir, `${module}.ts`);
      try {
        fs.writeFileSync(target, routeFile(module), "utf8");
        written.push(target);
      } catch (err) {
        errors.push(`failed to write ${module}.ts: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const indexTarget = path.join(outputDir, "src", "app.ts");
    try {
      fs.writeFileSync(indexTarget, indexFile(modules), "utf8");
      written.push(indexTarget);
    } catch (err) {
      errors.push(`failed to write app.ts: ${err instanceof Error ? err.message : String(err)}`);
    }

    return { written, errors };
  }
}
