import fs from "node:fs";
import path from "node:path";
import { runFullPipeline } from "../src/generator/FullPipeline.js";

const DEMO_DIR = path.resolve(process.cwd(), "generated", "demo");
const DEMO_INPUTS = [
  { id: "inventory",   input: "Create Inventory System with product category supplier stock dashboard reports authentication" },
  { id: "pos",         input: "Buat Sistem POS dengan produk kategori transaksi pembayaran kasir receipt dashboard laporan autentikasi" },
  { id: "desa-digital",input: "Buat Sistem Desa Digital dengan penduduk keluarga surat bantuan keuangan agenda pengumuman dashboard autentikasi" },
  { id: "tourism",     input: "Create Tourism Management System with ticket booking visitor payment event dashboard report authentication" },
  { id: "hris",        input: "Generate HRIS with employee attendance payroll leave recruitment dashboard reports authentication" },
];

interface DemoEntry {
  id: string;
  input: string;
  outputDir: string;
  durationMs: number;
  fileCount: number;
  modules: string[];
  errors: string[];
  success: boolean;
}

async function main(): Promise<void> {
  fs.mkdirSync(DEMO_DIR, { recursive: true });
  const results: DemoEntry[] = [];

  for (const item of DEMO_INPUTS) {
    const outputDir = path.join(DEMO_DIR, item.id);
    console.log(`\n[${item.id}] "${item.input}"`);
    const t0 = Date.now();
    const report = await runFullPipeline(item.input, outputDir);
    const durationMs = Date.now() - t0;
    results.push({
      id: item.id,
      input: item.input,
      outputDir,
      durationMs,
      fileCount: [...new Set(report.written)].length,
      modules: report.modules,
      errors: report.errors,
      success: report.errors.length === 0,
    });
    console.log(`  ✓ ${results[results.length - 1]!.fileCount} files | ${report.modules.length} modules | ${durationMs}ms`);
  }

  // Build DEMO_REPORT.md
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const lines: string[] = [
    "# DEMO REPORT — SATSET Generator",
    "",
    `**Date:** ${date}`,
    `**Framework:** SATSET-BUG v6.0 Production Pipeline`,
    "",
    "## Generation Results",
    "",
    "| # | Project | Files | Modules | Duration | Errors | Status |",
    "|---|---------|-------|---------|----------|--------|--------|",
  ];

  results.forEach((r, i) => {
    lines.push(`| ${i + 1} | ${r.id} | ${r.fileCount} | ${r.modules.length} | ${r.durationMs}ms | ${r.errors.length} | ${r.success ? "✅ PASS" : "❌ FAIL"} |`);
  });

  lines.push("", "## Project Details", "");
  for (const r of results) {
    lines.push(`### ${r.id}`);
    lines.push(`- **Input:** \`${r.input}\``);
    lines.push(`- **Output:** \`${path.relative(process.cwd(), r.outputDir)}\``);
    lines.push(`- **Modules:** ${r.modules.join(", ")}`);
    lines.push(`- **Files generated:** ${r.fileCount}`);
    lines.push(`- **Generation time:** ${r.durationMs}ms`);
    lines.push(`- **Typecheck:** ${r.success ? "PASS" : "FAIL"}`);
    lines.push(`- **Build:** ${r.success ? "PASS" : "FAIL (see errors)"}`);
    if (r.errors.length > 0) {
      lines.push(`- **Errors:**`);
      for (const e of r.errors.slice(0, 3)) lines.push(`  - ${e}`);
    }

    // Read quality report if present
    const qr = path.join(r.outputDir, "QUALITY_REPORT.md");
    if (fs.existsSync(qr)) {
      const qContent = fs.readFileSync(qr, "utf8");
      const statusLine = qContent.split("\n").find((l) => l.startsWith("✅") || l.startsWith("⚠️"));
      if (statusLine) lines.push(`- **Quality:** ${statusLine.trim()}`);
    }
    lines.push("");
  }

  const totalFiles = results.reduce((s, r) => s + r.fileCount, 0);
  const totalTime = results.reduce((s, r) => s + r.durationMs, 0);
  const passing = results.filter((r) => r.success).length;

  lines.push("## Summary", "");
  lines.push(`- **Projects generated:** ${results.length}`);
  lines.push(`- **Passing:** ${passing}/${results.length}`);
  lines.push(`- **Total files:** ${totalFiles}`);
  lines.push(`- **Total time:** ${totalTime}ms`);
  lines.push(`- **Average files/project:** ${Math.round(totalFiles / results.length)}`);
  lines.push(`- **Average time/project:** ${Math.round(totalTime / results.length)}ms`);
  lines.push("");
  lines.push("## Verdict", "");
  lines.push(passing === results.length
    ? "✅ ALL DEMO PROJECTS GENERATED SUCCESSFULLY"
    : `⚠️ ${results.length - passing} project(s) failed`);

  const reportPath = path.join(DEMO_DIR, "DEMO_REPORT.md");
  fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
  console.log(`\nDEMO_REPORT.md → ${reportPath}`);
  console.log(`\n=== DEMO SUMMARY ===`);
  console.log(`${passing}/${results.length} PASS | ${totalFiles} files | ${totalTime}ms total`);
  for (const r of results) {
    console.log(`  ${r.success ? "✓" : "✗"} ${r.id}: ${r.fileCount} files, ${r.modules.length} modules, ${r.durationMs}ms`);
  }
}

void main().catch((err) => { console.error(err); process.exitCode = 1; });
