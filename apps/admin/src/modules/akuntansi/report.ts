export function buildAkuntansiCsvReport(rows: Array<Record<string, unknown>>): string {
  const columns = ["id", "name", "status"];
  const head = columns.join(",");
  const body = rows
    .map((row) => columns.map((key) => {
      const value = String(row[key] ?? "");
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(","))
    .join("\n");

  return `${head}\n${body}`;
}
