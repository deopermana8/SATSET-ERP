import fs from "node:fs";
import path from "node:path";
import type { DomainModel, DomainEntity } from "./DomainModelGenerator.js";

export interface ReportExportGenerateResult {
  written: string[];
  errors: string[];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function csvExporter(entity: DomainEntity): string {
  const fields = entity.fields.map((f) => f.name);
  const header = fields.join(",");
  return `export function ${entity.name}ToCsv(rows: Record<string, unknown>[]): string {
  const header = "${header}";
  const lines = rows.map((row) =>
    [${fields.map((f) => `String(row["${f}"] ?? "")`).join(", ")}]
      .map((v) => v.includes(",") ? \`"\${v}"\` : v)
      .join(",")
  );
  return [header, ...lines].join("\\n");
}

export function download${cap(entity.name)}Csv(rows: Record<string, unknown>[]): void {
  const csv = ${entity.name}ToCsv(rows);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "${entity.name}.csv";
  a.click();
  URL.revokeObjectURL(url);
}
`;
}

function excelExporter(entity: DomainEntity): string {
  const fields = entity.fields.map((f) => f.name);
  return `// Excel export via tab-separated values (TSV) — open in Excel/Sheets without extra dependencies
export function ${entity.name}ToTsv(rows: Record<string, unknown>[]): string {
  const header = "${fields.join("\\t")}";
  const lines = rows.map((row) =>
    [${fields.map((f) => `String(row["${f}"] ?? "")`).join(", ")}].join("\\t")
  );
  return [header, ...lines].join("\\n");
}

export function download${cap(entity.name)}Excel(rows: Record<string, unknown>[]): void {
  const tsv = ${entity.name}ToTsv(rows);
  const blob = new Blob([tsv], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "${entity.name}.xls";
  a.click();
  URL.revokeObjectURL(url);
}
`;
}

function pdfExporter(entity: DomainEntity): string {
  const fields = entity.fields.map((f) => f.name);
  const rows = fields.map((f) => `    rows.forEach((row) => { y += 20; ctx.fillText(\`${f}: \${String(row["${f}"] ?? "")}\`, 40, y); });`).join("\n");
  return `// PDF export using Canvas API (browser) — no external dependencies
export function download${cap(entity.name)}Pdf(rows: Record<string, unknown>[]): void {
  const canvas = document.createElement("canvas");
  canvas.width = 794;
  canvas.height = Math.max(1123, 80 + rows.length * ${fields.length} * 20 + 40);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("${cap(entity.name)} Report", 40, 40);
  ctx.font = "12px sans-serif";

  let y = 60;
${rows}

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "${entity.name}-report.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
`;
}

export class ReportExportGenerator {
  generate(model: DomainModel, outputDir: string): ReportExportGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const dir = path.join(outputDir, "src", "exports");
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      errors.push(`failed to create ${dir}: ${err instanceof Error ? err.message : String(err)}`);
      return { written, errors };
    }

    for (const entity of model.entities) {
      const files: Record<string, string> = {
        [`src/exports/${entity.name}CsvExport.ts`]: csvExporter(entity),
        [`src/exports/${entity.name}ExcelExport.ts`]: excelExporter(entity),
        [`src/exports/${entity.name}PdfExport.ts`]: pdfExporter(entity),
      };

      for (const [filePath, content] of Object.entries(files)) {
        const target = path.join(outputDir, filePath);
        try {
          fs.writeFileSync(target, content, "utf8");
          written.push(target);
        } catch (err) {
          errors.push(`failed to write ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    return { written, errors };
  }
}
