import fs from "node:fs";
import path from "node:path";
import { runFullPipeline } from "../src/generator/FullPipeline.js";

interface BenchmarkEntry {
  name: string;
  requirement: string;
  outputDir: string;
  durationMs: number;
  fileCount: number;
  modules: string[];
  errors: string[];
  success: boolean;
}

const PROJECTS = [
  { name: "Inventory Management System", outputDir: "generated/inventory-system", requirement: "Create Inventory Management System with products stock suppliers purchase sales reports dashboard authentication" },
  { name: "Point Of Sale System",        outputDir: "generated/pos-system",        requirement: "Create Point Of Sale System with product category supplier customer cashier transaction cart payment receipt dashboard reports authentication" },
  { name: "HRIS",                        outputDir: "generated/hris",              requirement: "Create HRIS with employee department position attendance leave payroll recruitment dashboard reports authentication" },
  { name: "Village Information System",  outputDir: "generated/village-system",    requirement: "Create Village Information System with penduduk keluarga surat bantuan umkm bumdes keuangan aset agenda pengumuman dashboard authentication" },
  { name: "Tourism Management System",   outputDir: "generated/tourism-system",    requirement: "Create Tourism Management System with ticket booking outbound reservation visitor payment schedule event dashboard report authentication" },
];

async function main(): Promise<void> {
  const results: BenchmarkEntry[] = [];

  for (const project of PROJECTS) {
    console.log(`\nGenerating: ${project.name}...`);
    const start = Date.now();

    const report = await runFullPipeline(project.requirement, project.outputDir);

    results.push({
      name: project.name,
      requirement: project.requirement,
      outputDir: project.outputDir,
      durationMs: Date.now() - start,
      fileCount: [...new Set(report.written)].length,
      modules: report.modules,
      errors: report.errors,
      success: report.errors.length === 0,
    });

    console.log(`  ✓ ${results[results.length - 1]!.fileCount} files in ${results[results.length - 1]!.durationMs}ms`);
  }

  // Write benchmark report
  const lines: string[] = [
    "# Production Benchmark Report",
    "",
    `**Date:** ${new Date().toISOString().slice(0, 10)}`,
    `**Framework:** SATSET-BUG Generator Pipeline`,
    "",
    "## Results",
    "",
    "| Project | Files | Modules | Duration | Errors | Status |",
    "|---------|-------|---------|----------|--------|--------|",
  ];

  for (const r of results) {
    lines.push(`| ${r.name} | ${r.fileCount} | ${r.modules.length} | ${r.durationMs}ms | ${r.errors.length} | ${r.success ? "✅ PASS" : "❌ FAIL"} |`);
  }

  lines.push("", "## Module Coverage", "");
  for (const r of results) {
    lines.push(`### ${r.name}`);
    lines.push(`- **Modules:** ${r.modules.join(", ")}`);
    lines.push(`- **Files generated:** ${r.fileCount}`);
    lines.push(`- **Generation time:** ${r.durationMs}ms`);
    if (r.errors.length > 0) {
      lines.push(`- **Errors:**`);
      for (const e of r.errors.slice(0, 5)) lines.push(`  - ${e}`);
    }
    lines.push("");
  }

  const totalFiles = results.reduce((s, r) => s + r.fileCount, 0);
  const totalTime = results.reduce((s, r) => s + r.durationMs, 0);
  const passing = results.filter((r) => r.success).length;

  lines.push("## Summary", "");
  lines.push(`- **Total projects:** ${results.length}`);
  lines.push(`- **Passing:** ${passing}/${results.length}`);
  lines.push(`- **Total files generated:** ${totalFiles}`);
  lines.push(`- **Total generation time:** ${totalTime}ms`);
  lines.push(`- **Average files per project:** ${Math.round(totalFiles / results.length)}`);
  lines.push(`- **Average time per project:** ${Math.round(totalTime / results.length)}ms`);
  lines.push("");
  lines.push(`## Verdict`);
  lines.push("");
  lines.push(passing === results.length ? "✅ ALL PROJECTS GENERATED SUCCESSFULLY" : `⚠️ ${results.length - passing} project(s) failed`);

  const reportPath = path.join(process.cwd(), "benchmark-report.md");
  fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
  console.log(`\nReport written: ${reportPath}`);

  // Print summary to console
  console.log("\n=== BENCHMARK SUMMARY ===");
  console.log(`Projects: ${passing}/${results.length} PASS`);
  console.log(`Total files: ${totalFiles}`);
  console.log(`Total time: ${totalTime}ms`);
  for (const r of results) {
    console.log(`  ${r.success ? "✓" : "✗"} ${r.name}: ${r.fileCount} files, ${r.modules.length} modules, ${r.durationMs}ms`);
  }
}

void main().catch((err) => { console.error(err); process.exitCode = 1; });
