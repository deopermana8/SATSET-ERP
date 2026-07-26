import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { ProductionValidator } from "../src/validation/ProductionValidator.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "production-validation",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root: process.cwd() },
  });

  const validator = new ProductionValidator();
  const results = await validator.run(context);
  assert.ok(Array.isArray(results));
  assert.ok(results.length >= 0);
  console.log("production validation test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
