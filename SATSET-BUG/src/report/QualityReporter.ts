import fs from "node:fs";
import path from "node:path";

export interface QualityReportInput {
  outputDir: string;
  written: string[];
  errors: string[];
  modules: string[];
  expectedModules?: string[];
  durationMs?: number;
  typecheckPassed?: boolean;
  buildPassed?: boolean;
}

export interface QualityReportData {
  totalFiles: number;
  totalFolders: number;
  typecheckResult: "PASS" | "FAIL" | "UNKNOWN";
  buildResult: "PASS" | "FAIL" | "UNKNOWN";
  missingFiles: string[];
  missingModules: string[];
  duplicateFilenames: string[];
  todoMarkers: Array<{ file: string; line: number; content: string }>;
  durationMs: number;
  errors: string[];
}

export class QualityReporter {
  analyze(input: QualityReportInput): QualityReportData {
    const uniqueWritten = [...new Set(input.written)];

    // Count folders
    const folders = new Set<string>();
    for (const f of uniqueWritten) {
      let dir = path.dirname(f);
      while (dir !== path.dirname(dir)) {
        folders.add(dir);
        dir = path.dirname(dir);
      }
    }

    // Detect duplicate filenames (same basename in different dirs)
    const basenames = uniqueWritten.map((f) => path.basename(f));
    const seenBasenames = new Set<string>();
    const duplicateFilenames: string[] = [];
    for (const b of basenames) {
      if (seenBasenames.has(b)) {
        if (!duplicateFilenames.includes(b)) duplicateFilenames.push(b);
      }
      seenBasenames.add(b);
    }

    // Scan TODO markers in generated files
    const todoMarkers: QualityReportData["todoMarkers"] = [];
    for (const filePath of uniqueWritten) {
      try {
        if (!fs.existsSync(filePath)) continue;
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
          if (/TODO|FIXME|HACK|XXX/.test(line)) {
            todoMarkers.push({ file: path.relative(input.outputDir, filePath), line: idx + 1, content: line.trim().slice(0, 80) });
          }
        });
      } catch { /* skip unreadable */ }
    }

    // Missing modules
    const missingModules = (input.expectedModules ?? []).filter((m) => !input.modules.includes(m));

    // Missing critical files
    const criticalFiles = ["package.json", "README.md", path.join("prisma", "schema.prisma")];
    const missingFiles = criticalFiles.filter((f) => !fs.existsSync(path.join(input.outputDir, f)));

    return {
      totalFiles: uniqueWritten.length,
      totalFolders: folders.size,
      typecheckResult: input.typecheckPassed === true ? "PASS" : input.typecheckPassed === false ? "FAIL" : "UNKNOWN",
      buildResult: input.buildPassed === true ? "PASS" : input.buildPassed === false ? "FAIL" : "UNKNOWN",
      missingFiles,
      missingModules,
      duplicateFilenames,
      todoMarkers,
      durationMs: input.durationMs ?? 0,
      errors: input.errors,
    };
  }

  write(input: QualityReportInput): string {
    const data = this.analyze(input);
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");

    const lines: string[] = [
      "# Quality Report",
      "",
      `**Generated:** ${date}`,
      `**Output directory:** ${input.outputDir}`,
      "",
      "## Metrics",
      "",
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total generated files | ${data.totalFiles} |`,
      `| Total folders | ${data.totalFolders} |`,
      `| Generation duration | ${data.durationMs}ms |`,
      `| Typecheck | ${data.typecheckResult} |`,
      `| Build | ${data.buildResult} |`,
      `| Modules | ${input.modules.join(", ")} |`,
      "",
      "## Validation",
      "",
    ];

    lines.push(`### Missing Files (${data.missingFiles.length})`);
    if (data.missingFiles.length === 0) {
      lines.push("None — all critical files present. ✅");
    } else {
      for (const f of data.missingFiles) lines.push(`- \`${f}\``);
    }
    lines.push("");

    lines.push(`### Missing Modules (${data.missingModules.length})`);
    if (data.missingModules.length === 0) {
      lines.push("None. ✅");
    } else {
      for (const m of data.missingModules) lines.push(`- ${m}`);
    }
    lines.push("");

    lines.push(`### Duplicate Filenames (${data.duplicateFilenames.length})`);
    if (data.duplicateFilenames.length === 0) {
      lines.push("None. ✅");
    } else {
      for (const d of data.duplicateFilenames) lines.push(`- \`${d}\``);
    }
    lines.push("");

    lines.push(`### TODO Markers (${data.todoMarkers.length})`);
    if (data.todoMarkers.length === 0) {
      lines.push("None. ✅");
    } else {
      for (const t of data.todoMarkers.slice(0, 20)) {
        lines.push(`- \`${t.file}\` line ${t.line}: ${t.content}`);
      }
      if (data.todoMarkers.length > 20) lines.push(`- ... and ${data.todoMarkers.length - 20} more`);
    }
    lines.push("");

    lines.push(`### Pipeline Errors (${data.errors.length})`);
    if (data.errors.length === 0) {
      lines.push("None. ✅");
    } else {
      for (const e of data.errors.slice(0, 10)) lines.push(`- ${e}`);
    }
    lines.push("");

    const hasIssues = data.missingFiles.length > 0 || data.errors.length > 0 || data.missingModules.length > 0;
    lines.push("## Status");
    lines.push("");
    lines.push(hasIssues ? "⚠️ Issues found — review above." : "✅ Quality check passed.");

    const reportPath = path.join(input.outputDir, "QUALITY_REPORT.md");
    try {
      fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
    } catch { /* ignore write errors */ }

    return reportPath;
  }
}
