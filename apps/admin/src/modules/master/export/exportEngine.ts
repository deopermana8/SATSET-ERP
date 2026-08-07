import type { MasterRecord } from "../crud/types.js";
import { bulkExportCsv, bulkExportXls } from "../bulk/bulkEngine.js";

export type MasterExportFormat = "csv" | "excel" | "json" | "print";

type BrowserWindowLike = {
  document: {
    write: (html: string) => void;
    close: () => void;
  };
  print: () => void;
};

type BrowserRootLike = {
  open: (url: string, target?: string) => BrowserWindowLike | null;
};

export function exportMasterRecords(filename: string, items: MasterRecord[], format: MasterExportFormat): void {
  if (format === "csv") {
    bulkExportCsv(filename, items);
    return;
  }
  if (format === "excel") {
    bulkExportXls(filename, items);
    return;
  }
  const root = globalThis as { document?: { createElement: (tag: string) => { href: string; download: string; click: () => void; textContent?: string } }; URL?: { createObjectURL: (blob: Blob) => string; revokeObjectURL: (url: string) => void }; Blob?: typeof Blob };
  if (format === "json" && root.document && root.URL && root.Blob) {
    const blob = new root.Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const anchor = root.document.createElement("a");
    anchor.href = root.URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
    root.URL.revokeObjectURL(anchor.href);
    return;
  }
  if (format === "print" && root.document) {
    const win = (globalThis as unknown as BrowserRootLike).open("", "_blank");
    if (!win) {
      return;
    }
    win.document.write(`<pre>${items.map((item) => `${item.id}\t${item.name}\t${item.status}`).join("\n")}</pre>`);
    win.document.close();
    win.print();
  }
}
