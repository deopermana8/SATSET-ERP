import { exportCsv, exportXls } from "../../../services/export.js";
import { validateRecord } from "./validation.js";
import type { MasterEntityConfig, MasterImportPreviewResult } from "./types.js";

type CsvRow = Record<string, string>;

function parseCsvLine(line: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      cols.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  cols.push(current.trim());
  return cols;
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

export function buildImportTemplate<TRecord extends Record<string, unknown>>(entity: MasterEntityConfig<TRecord>): string[][] {
  const headers = entity.fields.map((field) => field.name);
  return [headers];
}

export function previewImport<TRecord extends Record<string, unknown>>(
  entity: MasterEntityConfig<TRecord>,
  csvText: string,
  existingRows: TRecord[] = [],
): MasterImportPreviewResult<TRecord> {
  const rawRows = parseCsv(csvText);
  const fieldRules = Object.fromEntries(entity.fields.map((field) => [String(field.name), field.validation ?? []]));

  const rows = rawRows.map((raw, index) => {
    const parsed: Partial<TRecord> = {};
    for (const field of entity.fields) {
      parsed[field.name as keyof TRecord] = raw[String(field.name)] as TRecord[keyof TRecord];
    }

    const validation = validateRecord(entity.key, parsed, fieldRules, existingRows);
    return {
      rowNumber: index + 2,
      raw,
      parsed,
      errors: validation.errors,
    };
  });

  const invalidRows = rows.filter((row) => row.errors.length > 0).length;
  return {
    totalRows: rows.length,
    validRows: rows.length - invalidRows,
    invalidRows,
    rows,
  };
}

export function buildImportErrorReport<TRecord extends Record<string, unknown>>(preview: MasterImportPreviewResult<TRecord>): string[][] {
  const report: string[][] = [["Baris", "Error"]];
  preview.rows.forEach((row) => {
    if (row.errors.length > 0) {
      report.push([String(row.rowNumber), row.errors.join(" | ")]);
    }
  });
  return report;
}

export function exportRecords<TRecord extends Record<string, unknown>>(
  entityName: string,
  rows: TRecord[],
  format: "csv" | "excel",
): void {
  if (rows.length === 0) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const matrix = [headers, ...rows.map((row) => headers.map((header) => String(row[header] ?? "")))];

  if (format === "csv") {
    exportCsv(`${entityName}-ekspor.csv`, matrix);
    return;
  }
  exportXls(`${entityName}-ekspor.xls`, matrix);
}
