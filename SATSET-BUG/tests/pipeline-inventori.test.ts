import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runGeneratorPipeline } from "../src/generator/GeneratorPipeline.js";

async function main(): Promise<void> {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "satset-inventori-"));

  try {
    const report = await runGeneratorPipeline("Buat aplikasi inventori", outputDir);

    assert.ok(report.projectType !== undefined, "projectType must be defined");
    assert.ok(report.modules.length > 0, "modules must not be empty");
    assert.ok(report.modules.includes("inventory"), "inventory module must be planned");

    // Verify base files
    for (const file of ["package.json", "tsconfig.json", "README.md", ".gitignore"]) {
      assert.ok(fs.existsSync(path.join(outputDir, file)), `${file} must exist`);
    }

    // Verify prisma schema
    assert.ok(
      fs.existsSync(path.join(outputDir, "prisma", "schema.prisma")),
      "prisma/schema.prisma must exist"
    );

    // Verify React app files
    assert.ok(fs.existsSync(path.join(outputDir, "src", "App.tsx")), "src/App.tsx must exist");
    assert.ok(fs.existsSync(path.join(outputDir, "src", "Layout.tsx")), "src/Layout.tsx must exist");

    // Verify REST API
    assert.ok(fs.existsSync(path.join(outputDir, "src", "app.ts")), "src/app.ts must exist");

    // Verify dashboard
    assert.ok(
      fs.existsSync(path.join(outputDir, "src", "components", "Navbar.tsx")),
      "Navbar.tsx must exist"
    );
    assert.ok(
      fs.existsSync(path.join(outputDir, "src", "components", "Sidebar.tsx")),
      "Sidebar.tsx must exist"
    );

    assert.equal(report.errors.length, 0, `pipeline must have no errors: ${report.errors.join(", ")}`);
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }

  console.log("PASS");
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
