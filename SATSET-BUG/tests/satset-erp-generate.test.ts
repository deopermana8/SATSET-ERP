import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runFullPipeline } from "../src/generator/FullPipeline.js";

const OUTPUT_DIR = path.resolve(process.cwd(), "generated", "satset-erp");

async function main(): Promise<void> {
  console.log("Generating SATSET ERP...");

  const report = await runFullPipeline(
    "Create SATSET ERP with authentication dashboard user role permission customer supplier category product warehouse inventory purchase sales cashier invoice payment accounting journal asset employee attendance payroll reports settings",
    OUTPUT_DIR
  );

  assert.equal(report.errors.length, 0, `Pipeline errors: ${report.errors.join("; ")}`);
  assert.ok(report.written.length > 0, "Must write files");

  const required = [
    "package.json", "README.md",
    path.join("prisma", "schema.prisma"),
    path.join("src", "App.tsx"),
    path.join("src", "app.ts"),
    path.join("src", "lib", "jwt.ts"),
    path.join("src", "routes", "auth.ts"),
    "API.md", "DATABASE.md", "INSTALL.md", "QUALITY_REPORT.md",
  ];
  for (const file of required) {
    assert.ok(fs.existsSync(path.join(OUTPUT_DIR, file)), `Required: ${file}`);
  }

  const uniqueFiles = [...new Set(report.written)].length;
  console.log(`Generated ${uniqueFiles} files.`);
  console.log("Modules:", report.modules.join(", "));
  console.log("Entities:", report.entities.join(", "));
  console.log("\nSATSET ERP GENERATION PASS");
}

void main().catch((err) => { console.error(err); process.exitCode = 1; });
