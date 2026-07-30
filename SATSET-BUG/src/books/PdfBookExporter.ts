import path from "node:path";
import fs from "node:fs";
import { BookGenerator, type BookContext } from "../generator/BookGenerator.js";

export interface PdfBookExportResult {
  file: string;
  success: boolean;
  error?: string;
}

const A4_STYLE = `
  @page {
    size: A4;
    margin: 2.5cm 2cm 2.5cm 2cm;
    @top-center { content: string(chapter-title); font-size: 9pt; color: #64748b; }
    @bottom-center { content: "Page " counter(page) " of " counter(pages); font-size: 9pt; color: #64748b; }
  }
  * { box-sizing: border-box; }
  body { font-family: "Times New Roman", serif; font-size: 11pt; line-height: 1.6; color: #1e293b; margin: 0; }
  h1 { string-set: chapter-title content(); page-break-before: always; font-size: 20pt; margin-bottom: 0.5em; }
  h2 { font-size: 15pt; margin-top: 1.5em; }
  h3 { font-size: 12pt; margin-top: 1.2em; }
  pre { background: #f8fafc; padding: 0.8em; border-left: 3px solid #3b82f6; font-size: 9pt; page-break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; margin: 1em 0; page-break-inside: avoid; }
  th, td { border: 1px solid #cbd5e1; padding: 0.4em 0.8em; font-size: 10pt; }
  th { background: #f1f5f9; font-weight: bold; }
  img { max-width: 100%; height: auto; }
  .cover { page-break-after: always; text-align: center; padding-top: 8cm; }
  .cover h1 { font-size: 28pt; border: none; page-break-before: avoid; }
  .cover .subtitle { font-size: 16pt; color: #475569; margin-top: 0.5em; }
  .cover .author { font-size: 13pt; margin-top: 3cm; }
  .cover .date { font-size: 11pt; color: #64748b; margin-top: 0.5em; }
  .toc { page-break-after: always; }
  .toc h2 { margin-bottom: 1em; }
  .toc ol { padding-left: 1.5em; }
  .toc li { margin: 0.3em 0; }
  .toc a { color: inherit; text-decoration: none; }
  .toc a::after { content: leader(".") target-counter(attr(href), page); }
  blockquote { border-left: 3px solid #94a3b8; margin-left: 0; padding-left: 1em; color: #475569; font-style: italic; }
  @media print { .cover { page-break-after: always; } }
`;

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mdToHtml(md: string): string {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) =>
      `<pre><code class="language-${lang}">${escHtml(code.trimEnd())}</code></pre>`)
    .replace(/^#{3} (.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2} (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^---$/gm, "<hr>")
    .replace(/\n\n+/g, "</p>\n<p>")
    .replace(/^(?!<[hpuolibdr])/, "<p>")
    .replace(/(?<![>])$/, "</p>");
}

function buildToc(ctx: BookContext): string {
  const items = ctx.chapters.map((ch, i) => {
    const anchor = `ch-${i + 1}`;
    return `<li><a href="#${anchor}">${escHtml(ch.title)}</a></li>`;
  }).join("\n");
  return `<section class="toc">\n<h2>Table of Contents</h2>\n<ol>\n${items}\n</ol>\n</section>`;
}

function buildCover(ctx: BookContext): string {
  return `<section class="cover">
<h1>${escHtml(ctx.title)}</h1>
${ctx.subtitle ? `<div class="subtitle">${escHtml(ctx.subtitle)}</div>` : ""}
<div class="author">${escHtml(ctx.author)}</div>
${ctx.date ? `<div class="date">${escHtml(ctx.date)}</div>` : ""}
</section>`;
}

export class PdfBookExporter {
  async export(ctx: BookContext): Promise<PdfBookExportResult> {
    // Generate markdown via BookGenerator
    const generator = new BookGenerator();
    const { written, errors } = generator.generate(ctx);
    if (errors.length > 0) return { file: "", success: false, error: errors.join("; ") };

    const mdFile = written[0];
    if (!mdFile) return { file: "", success: false, error: "no markdown generated" };

    let markdown: string;
    try {
      markdown = fs.readFileSync(mdFile, "utf8");
    } catch (err) {
      return { file: "", success: false, error: err instanceof Error ? err.message : String(err) };
    }

    // Build HTML
    const cover = buildCover(ctx);
    const toc = buildToc(ctx);
    const body = mdToHtml(markdown);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escHtml(ctx.title)}</title>
<style>${A4_STYLE}</style>
</head>
<body>
${cover}
${toc}
<main>
${body}
</main>
</body>
</html>`;

    const outputDir = path.join(ctx.outputDir, "book");
    const filename = ctx.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60) || "book";
    const file = path.join(outputDir, `${filename}.a4.html`);

    try {
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(file, html, "utf8");
      return { file, success: true };
    } catch (err) {
      return { file, success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}
