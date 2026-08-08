import { generateController } from "../controller/index.js";
import { generateDto } from "../dto/index.js";
import { generateForm } from "../form/index.js";
import { generateHooks } from "../hooks/index.js";
import { generateModule } from "../module/index.js";
import { generateOpenApi } from "../openapi/index.js";
import { generatePage } from "../page/index.js";
import { generatePrismaModel } from "../prisma/index.js";
import { generateReactQueryApi } from "../react-query/index.js";
import { generateRepository } from "../repository/index.js";
import { generateRoute } from "../route/index.js";
import { generateService } from "../service/index.js";
import { generateTable } from "../table/index.js";
import { generateValidator } from "../validator/index.js";
import { generateApi } from "../api/index.js";
import { generateBarrel } from "../barrel/index.js";
import type { Generator } from "../generator.js";

export interface GeneratorManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  generator: Generator;
}

export function loadBuiltinGeneratorManifest(): GeneratorManifest[] {
  return [
    {
      id: "prisma",
      name: "Prisma",
      version: "1.0.0",
      description: "Generate Prisma model file from DST specification.",
      generator: {
        id: "prisma",
        name: "prisma",
        dependencies: [],
        generate: (spec) => [generatePrismaModel(spec)]
      }
    },
    {
      id: "route",
      name: "Route",
      version: "1.0.0",
      description: "Generate API route definition file from DST specification.",
      generator: {
        id: "route",
        name: "route",
        dependencies: ["controller"],
        generate: (spec) => [generateRoute(spec)]
      }
    },
    {
      id: "repository",
      name: "Repository",
      version: "1.0.0",
      description: "Generate repository scaffold file from DST specification.",
      generator: {
        id: "repository",
        name: "repository",
        dependencies: ["prisma"],
        generate: (spec) => [generateRepository(spec)]
      }
    },
    {
      id: "service",
      name: "Service",
      version: "1.0.0",
      description: "Generate service scaffold file from DST specification.",
      generator: {
        id: "service",
        name: "service",
        dependencies: ["repository"],
        generate: (spec) => [generateService(spec)]
      }
    },
    {
      id: "controller",
      name: "Controller",
      version: "1.0.0",
      description: "Generate controller scaffold file from DST specification.",
      generator: {
        id: "controller",
        name: "controller",
        dependencies: ["service"],
        generate: (spec) => [generateController(spec)]
      }
    },
    {
      id: "dto",
      name: "DTO",
      version: "1.0.0",
      description: "Generate DTO interfaces file from DST specification.",
      generator: {
        id: "dto",
        name: "dto",
        dependencies: [],
        generate: (spec) => [generateDto(spec)]
      }
    },
    {
      id: "validator",
      name: "Validator",
      version: "1.0.0",
      description: "Generate validator scaffold file from DST specification.",
      generator: {
        id: "validator",
        name: "validator",
        dependencies: [],
        generate: (spec) => [generateValidator(spec)]
      }
    },
    {
      id: "api",
      name: "API",
      version: "1.0.0",
      description: "Generate Express API router file from DST specification.",
      generator: {
        id: "api",
        name: "api",
        dependencies: ["controller"],
        generate: (spec) => [generateApi(spec)]
      }
    },
    {
      id: "openapi",
      name: "OpenAPI",
      version: "1.0.0",
      description: "Generate OpenAPI document scaffold file from DST specification.",
      generator: {
        id: "openapi",
        name: "openapi",
        dependencies: ["controller"],
        generate: (spec) => [generateOpenApi(spec)]
      }
    },
    {
      id: "react-query",
      name: "React Query",
      version: "1.0.0",
      description: "Generate React Query API client file from DST specification.",
      generator: {
        id: "react-query",
        name: "react-query",
        dependencies: ["api", "dto"],
        generate: (spec) => [generateReactQueryApi(spec)]
      }
    },
    {
      id: "hooks",
      name: "Hooks",
      version: "1.0.0",
      description: "Generate React hooks scaffold based on React Query API client.",
      generator: {
        id: "hooks",
        name: "hooks",
        dependencies: ["react-query"],
        generate: (spec) => [generateHooks(spec)]
      }
    },
    {
      id: "table",
      name: "Table",
      version: "1.0.0",
      description: "Generate React table scaffold component based on hooks generator.",
      generator: {
        id: "table",
        name: "table",
        dependencies: ["hooks"],
        generate: (spec) => [generateTable(spec)]
      }
    },
    {
      id: "form",
      name: "Form",
      version: "1.0.0",
      description: "Generate React form scaffold component using hooks and DTO contracts.",
      generator: {
        id: "form",
        name: "form",
        dependencies: ["hooks", "dto"],
        generate: (spec) => [generateForm(spec)]
      }
    },
    {
      id: "page",
      name: "Page",
      version: "1.0.0",
      description: "Generate React CRUD page scaffold using table and form components.",
      generator: {
        id: "page",
        name: "page",
        dependencies: ["table", "form"],
        generate: (spec) => [generatePage(spec)]
      }
    },
    {
      id: "module",
      name: "Module",
      version: "1.0.0",
      description: "Generate frontend module entry-point scaffold exporting generated artifacts.",
      generator: {
        id: "module",
        name: "module",
        dependencies: ["page", "table", "form", "hooks", "react-query", "api"],
        generate: (spec) => [generateModule(spec)]
      }
    },
    {
      id: "barrel",
      name: "Barrel",
      version: "1.0.0",
      description: "Generate index.ts barrel exports for backend and frontend artifacts.",
      generator: {
        id: "barrel",
        name: "barrel",
        dependencies: ["module"],
        generate: (spec) => generateBarrel(spec)
      }
    }
  ];
}
