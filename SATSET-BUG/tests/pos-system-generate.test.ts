import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runFullPipeline } from "../src/generator/FullPipeline.js";

const OUTPUT_DIR = path.resolve(process.cwd(), "generated", "pos-system");

async function main(): Promise<void> {
  console.log("Generating Point Of Sale System...");
  console.log(`Output: ${OUTPUT_DIR}`);

  const report = await runFullPipeline(
    "Create Point Of Sale System with product category supplier customer cashier transaction cart payment receipt dashboard reports authentication",
    OUTPUT_DIR
  );

  assert.equal(report.errors.length, 0, `Pipeline errors: ${report.errors.join("; ")}`);
  assert.ok(report.written.length > 0, "Must write files");

  const required = [
    "package.json",
    "README.md",
    path.join("prisma", "schema.prisma"),
    path.join("src", "App.tsx"),
    path.join("src", "app.ts"),
    path.join("src", "components", "Navbar.tsx"),
    path.join("src", "lib", "jwt.ts"),
    path.join("src", "routes", "auth.ts"),
    "API.md",
    "DATABASE.md",
    "INSTALL.md",
  ];

  for (const file of required) {
    assert.ok(fs.existsSync(path.join(OUTPUT_DIR, file)), `Required file must exist: ${file}`);
  }

  console.log(`\nGenerated ${report.written.length} files.`);
  console.log("Modules:", report.modules.join(", "));
  console.log("\nPOS SYSTEM GENERATION PASS");
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
