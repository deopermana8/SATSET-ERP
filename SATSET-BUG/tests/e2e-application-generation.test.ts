import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runFullPipeline } from "../src/generator/FullPipeline.js";

async function main(): Promise<void> {
  const requirement = "Buat aplikasi toko online dengan produk kategori order payment";
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "satset-e2e-"));

  try {
    const report = await runFullPipeline(requirement, outputDir);

    assert.equal(report.errors.length, 0, `pipeline must have no errors: ${report.errors.join("; ")}`);
    assert.ok(report.modules.length > 0, "modules must be planned");
    assert.ok(report.entities.length > 0, "domain entities must be generated");

    const required = [
      path.join("prisma", "schema.prisma"),
      path.join("src", "app.ts"),
      "package.json",
      "README.md",
    ];

    for (const file of required) {
      assert.ok(fs.existsSync(path.join(outputDir, file)), `must exist: ${file}`);
    }

    // Verify at least one file in each required directory
    const requiredDirs = [
      path.join("src", "routes"),
      path.join("src", "controllers"),
      path.join("src", "services"),
      path.join("src", "repositories"),
      path.join("src", "components"),
    ];

    for (const dir of requiredDirs) {
      const fullDir = path.join(outputDir, dir);
      assert.ok(fs.existsSync(fullDir), `directory must exist: ${dir}`);
      const entries = fs.readdirSync(fullDir);
      assert.ok(entries.length > 0, `directory must not be empty: ${dir}`);
    }

    // Verify prisma schema has at least one model
    const schema = fs.readFileSync(path.join(outputDir, "prisma", "schema.prisma"), "utf8");
    assert.ok(schema.includes("model "), "schema.prisma must contain at least one model");

    // Verify src/app.ts wires routes
    const app = fs.readFileSync(path.join(outputDir, "src", "app.ts"), "utf8");
    assert.ok(app.includes("express"), "src/app.ts must use express");

  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }

  console.log("e2e application generation test passed");
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
