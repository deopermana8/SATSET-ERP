import fs from "node:fs";
import path from "node:path";
import type { BookRenderAdapter } from "./BookRenderAdapter.js";

/**
 * PdfAdapter — outputs an HTML file with print-optimised CSS.
 * Full PDF rendering requires a headless browser (e.g. Playwright) at runtime;
 * this adapter generates the print-ready HTML source without external dependencies.
 */
export class PdfAdapter implements BookRenderAdapter {
  readonly format = "pdf";

  async render(markdown: string, title: string, outputDir: string): Promise<{ file: string; error?: string }> {
    const file = path.join(outputDir, `${sanitize(title)}.print.html`);
    try {
      fs.mkdirSync(outputDir, { recursive: true });
      const html = wrapHtml(title, markdownToHtml(markdown), PDF_STYLE);
      fs.writeFileSync(file, html, "utf8");
      return { file };
    } catch (err) {
      return { file, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

const PDF_STYLE = `
  body { font-family: Georgia, serif; max-width: 800px; margin: 2cm auto; font-size: 12pt; line-height: 1.6; }
  h1, h2, h3 { page-break-after: avoid; }
  pre { background: #f5f5f5; padding: 0.8em; border-radius: 4px; font-size: 10pt; page-break-inside: avoid; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #ccc; padding: 0.4em 0.8em; }
  @media print { body { margin: 0; } }
`;

function sanitize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 80) || "book";
}

function wrapHtml(title: string, body: string, style: string): string {
  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title>${escHtml(title)}</title>\n<style>${style}</style>\n</head>\n<body>\n${body}\n</body>\n</html>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function markdownToHtml(md: string): string {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => `<pre><code class="language-${lang}">${escHtml(code.trimEnd())}</code></pre>`)
    .replace(/^#{3} (.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2} (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^---$/gm, "<hr>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}
