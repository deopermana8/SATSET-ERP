import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { BackendGenerator } from "../src/ai/engines/BackendGenerator.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-blueprint-"));
  const context = new Context({
    projectRoot: root,
    projectName: "inventory-suite",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root,
      idea: "inventory management",
      reasoning: {
        intent: "Build inventory management",
        domain: "retail",
        requirements: ["Authentication", "Inventory workflows", "Audit trail"],
        entities: ["Product", "InventoryMovement"],
        relationships: ["Product has many InventoryMovement"],
        useCases: ["Create product", "List products", "Adjust stock"],
        apiSpec: ["GET /products", "POST /products"],
        databaseDesign: ["Prisma schema for product inventory"],
        screenSpecs: ["Inventory dashboard"],
      },
    },
  });

  await new BackendGenerator().run(context);
  const output = path.join(root, "src", "api", "products", "products.controller.ts");
  const rendered = await fs.readFile(output, "utf8");
  assert.match(rendered, /Create product|POST \/products|Inventory/i, "backend controller should reflect blueprint use cases");
  console.log("blueprint-driven backend generation passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
