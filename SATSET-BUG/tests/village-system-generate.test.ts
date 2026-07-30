import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runFullPipeline } from "../src/generator/FullPipeline.js";

const OUTPUT_DIR = path.resolve(process.cwd(), "generated", "village-system");

async function main(): Promise<void> {
  console.log("Generating Village Information System...");
  const report = await runFullPipeline(
    "Create Village Information System with penduduk keluarga surat bantuan umkm bumdes keuangan aset agenda pengumuman dashboard authentication",
    OUTPUT_DIR
  );

  assert.equal(report.errors.length, 0, `Pipeline errors: ${report.errors.join("; ")}`);
  assert.ok(report.written.length > 0, "Must write files");

  const required = [
    "package.json", "README.md",
    path.join("prisma", "schema.prisma"),
    path.join("src", "App.tsx"),
    path.join("src", "app.ts"),
    "API.md", "INSTALL.md",
  ];
  for (const file of required) {
    assert.ok(fs.existsSync(path.join(OUTPUT_DIR, file)), `Required: ${file}`);
  }

  console.log(`Generated ${report.written.length} files.`);
  console.log("Modules:", report.modules.join(", "));
  console.log("VILLAGE SYSTEM GENERATION PASS");
}

void main().catch((err) => { console.error(err); process.exitCode = 1; });
