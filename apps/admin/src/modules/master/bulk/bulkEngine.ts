import type { MasterRecord } from "../crud/types.js";
import { exportCsv, exportXls } from "../../../services/export.js";

export function bulkDeleteSelection<T extends MasterRecord>(items: T[], selectedIds: string[]): T[] {
  const selected = new Set(selectedIds);
  return items.filter((item) => !selected.has(item.id));
}

export function bulkExportCsv(filename: string, items: Array<MasterRecord>): void {
  const rows = [["ID", "Name", "Status"], ...items.map((item) => [item.id, item.name, item.status])];
  exportCsv(filename, rows);
}

export function bulkExportXls(filename: string, items: Array<MasterRecord>): void {
  const rows = [["ID", "Name", "Status"], ...items.map((item) => [item.id, item.name, item.status])];
  exportXls(filename, rows);
}
