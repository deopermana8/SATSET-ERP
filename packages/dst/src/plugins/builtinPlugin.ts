import { generateController } from "../generators/controller/index.js";
import { generateDto } from "../generators/dto/index.js";
import { generateForm } from "../generators/form/index.js";
import { generateHooks } from "../generators/hooks/index.js";
import { generateModule } from "../generators/module/index.js";
import { generateOpenApi } from "../generators/openapi/index.js";
import { generatePage } from "../generators/page/index.js";
import { generatePrismaModel } from "../generators/prisma/index.js";
import { generateReactQueryApi } from "../generators/react-query/index.js";
import { generateRepository } from "../generators/repository/index.js";
import { generateRoute } from "../generators/route/index.js";
import { generateService } from "../generators/service/index.js";
import { generateTable } from "../generators/table/index.js";
import { generateValidator } from "../generators/validator/index.js";
import { generateApi } from "../generators/api/index.js";
import { generateBarrel } from "../generators/barrel/index.js";
import type { DstPlugin } from "./dstPlugin.js";

export const BuiltinPlugin: DstPlugin = {
  id: "builtin",
  name: "DST Builtin Plugin",
  version: "1.0.0",
  generators: [
    {
      id: "prisma",
      name: "prisma",
      dependencies: [],
      generate: (spec) => [generatePrismaModel(spec)]
    },
    {
      id: "route",
      name: "route",
      dependencies: ["controller"],
      generate: (spec) => [generateRoute(spec)]
    },
    {
      id: "repository",
      name: "repository",
      dependencies: ["prisma"],
      generate: (spec) => [generateRepository(spec)]
    },
    {
      id: "service",
      name: "service",
      dependencies: ["repository"],
      generate: (spec) => [generateService(spec)]
    },
    {
      id: "controller",
      name: "controller",
      dependencies: ["service"],
      generate: (spec) => [generateController(spec)]
    },
    {
      id: "dto",
      name: "dto",
      dependencies: [],
      generate: (spec) => [generateDto(spec)]
    },
    {
      id: "validator",
      name: "validator",
      dependencies: [],
      generate: (spec) => [generateValidator(spec)]
    },
    {
      id: "api",
      name: "api",
      dependencies: ["controller"],
      generate: (spec) => [generateApi(spec)]
    },
    {
      id: "openapi",
      name: "openapi",
      dependencies: ["controller"],
      generate: (spec) => [generateOpenApi(spec)]
    },
    {
      id: "react-query",
      name: "react-query",
      dependencies: ["api", "dto"],
      generate: (spec) => [generateReactQueryApi(spec)]
    },
    {
      id: "hooks",
      name: "hooks",
      dependencies: ["react-query"],
      generate: (spec) => [generateHooks(spec)]
    },
    {
      id: "table",
      name: "table",
      dependencies: ["hooks"],
      generate: (spec) => [generateTable(spec)]
    },
    {
      id: "form",
      name: "form",
      dependencies: ["hooks", "dto"],
      generate: (spec) => [generateForm(spec)]
    },
    {
      id: "page",
      name: "page",
      dependencies: ["table", "form"],
      generate: (spec) => [generatePage(spec)]
    },
    {
      id: "module",
      name: "module",
      dependencies: ["page", "table", "form", "hooks", "react-query", "api"],
      generate: (spec) => [generateModule(spec)]
    },
    {
      id: "barrel",
      name: "barrel",
      dependencies: ["module"],
      generate: (spec) => generateBarrel(spec)
    }
  ]
};
