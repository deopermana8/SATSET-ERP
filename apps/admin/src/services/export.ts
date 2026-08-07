export function exportCsv(filename: string, rows: Array<Array<string | number | null | undefined>>): void {
  const doc = (globalThis as { document?: { createElement: (tag: string) => { href: string; download: string; click: () => void } } }).document;
  if (!doc) {
    return;
  }
  const csv = rows
    .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const anchor = doc.createElement("a");
  anchor.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  anchor.download = filename;
  anchor.click();
}

export function exportXls(filename: string, rows: Array<Array<string | number | null | undefined>>): void {
  const root = globalThis as {
    document?: { createElement: (tag: string) => { href: string; download: string; click: () => void } };
    URL?: { createObjectURL: (value: unknown) => string; revokeObjectURL: (value: string) => void };
    Blob?: new (parts?: unknown[], options?: { type?: string }) => unknown;
  };
  if (!root.document || !root.URL || !root.Blob) {
    return;
  }
  const head = rows[0] ?? [];
  const bodyRows = rows.slice(1);
  let table = "<table><tr>";
  table += head.map((cell) => `<th>${String(cell ?? "")}</th>`).join("");
  table += "</tr>";
  for (const row of bodyRows) {
    table += `<tr>${row.map((cell) => `<td>${String(cell ?? "")}</td>`).join("")}</tr>`;
  }
  table += "</table>";
  const blob = new root.Blob([`<html><body>${table}</body></html>`], { type: "application/vnd.ms-excel" });
  const anchor = root.document.createElement("a");
  anchor.href = root.URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
  root.URL.revokeObjectURL(anchor.href);
}
