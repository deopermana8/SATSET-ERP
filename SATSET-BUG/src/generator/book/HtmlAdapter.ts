import fs from "node:fs";
import path from "node:path";
import type { BookRenderAdapter } from "./BookRenderAdapter.js";

export class HtmlAdapter implements BookRenderAdapter {
  readonly format = "html";

  async render(markdown: string, title: string, outputDir: string): Promise<{ file: string; error?: string }> {
    const file = path.join(outputDir, `${sanitize(title)}.html`);
    try {
      fs.mkdirSync(outputDir, { recursive: true });
      const html = wrapHtml(title, markdownToHtml(markdown));
      fs.writeFileSync(file, html, "utf8");
      return { file };
    } catch (err) {
      return { file, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

function sanitize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 80) || "book";
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escHtml(title)}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 860px; margin: 2rem auto; padding: 0 1rem; line-height: 1.7; color: #1e293b; background: #fff; }
  h1, h2, h3 { margin-top: 2rem; }
  pre { background: #f1f5f9; padding: 1rem; border-radius: 6px; overflow-x: auto; }
  code { font-family: 'Courier New', monospace; font-size: 0.9em; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
  th, td { border: 1px solid #e2e8f0; padding: 0.5rem 1rem; text-align: left; }
  th { background: #f8fafc; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
  img { max-width: 100%; height: auto; }
  em { color: #64748b; }
  @media (prefers-color-scheme: dark) {
    body { background: #0f172a; color: #f8fafc; }
    pre { background: #1e293b; }
    th { background: #1e293b; }
    td, th { border-color: #334155; }
    hr { border-color: #334155; }
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function markdownToHtml(md: string): string {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) =>
      `<pre><code class="language-${lang}">${escHtml(code.trimEnd())}</code></pre>`)
    .replace(/^#{3} (.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2} (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^---$/gm, "<hr>")
    .replace(/\n\n+/g, "</p>\n<p>")
    .replace(/^(?!<[hpuoli])/, "<p>")
    .replace(/(?<![>])$/, "</p>");
}
