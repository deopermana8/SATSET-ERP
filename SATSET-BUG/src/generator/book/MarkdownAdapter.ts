import fs from "node:fs";
import path from "node:path";
import type { BookRenderAdapter } from "./BookRenderAdapter.js";

export class MarkdownAdapter implements BookRenderAdapter {
  readonly format = "markdown";

  async render(markdown: string, title: string, outputDir: string): Promise<{ file: string; error?: string }> {
    const file = path.join(outputDir, `${sanitize(title)}.md`);
    try {
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(file, markdown, "utf8");
      return { file };
    } catch (err) {
      return { file, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

function sanitize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 80) || "book";
}
