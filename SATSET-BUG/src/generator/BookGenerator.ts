import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderTemplate } from "../template/TemplateEngine.js";

export interface BookImage {
  alt: string;
  src: string;
  caption?: string;
}

export interface BookTable {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface BookCodeBlock {
  language: string;
  code: string;
  caption?: string;
}

export interface BookSubchapter {
  title: string;
  content: string;
  codeBlocks?: BookCodeBlock[];
  tables?: BookTable[];
  images?: BookImage[];
}

export interface BookChapter {
  title: string;
  content?: string;
  subchapters?: BookSubchapter[];
  codeBlocks?: BookCodeBlock[];
  tables?: BookTable[];
  images?: BookImage[];
}

export interface BookReference {
  id: string;
  title: string;
  author?: string;
  url?: string;
  year?: number;
}

export interface BookContext {
  title: string;
  subtitle?: string;
  author: string;
  date?: string;
  description?: string;
  chapters: BookChapter[];
  appendix?: BookChapter[];
  references?: BookReference[];
  outputDir: string;
}

export interface BookGenerateResult {
  written: string[];
  errors: string[];
}

function renderImage(img: BookImage): string {
  return `![${img.alt}](${img.src})${img.caption ? `\n*${img.caption}*` : ""}`;
}

function renderTable(table: BookTable): string {
  const header = `| ${table.headers.join(" | ")} |`;
  const sep = `| ${table.headers.map(() => "---").join(" | ")} |`;
  const rows = table.rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${header}\n${sep}\n${rows}${table.caption ? `\n*${table.caption}*` : ""}`;
}

function renderCodeBlock(block: BookCodeBlock): string {
  return `\`\`\`${block.language}\n${block.code}\n\`\`\`${block.caption ? `\n*${block.caption}*` : ""}`;
}

function renderSubchapter(sub: BookSubchapter, depth: number): string {
  const heading = "#".repeat(depth);
  const parts: string[] = [`${heading} ${sub.title}`, ""];
  if (sub.content) parts.push(sub.content, "");
  for (const img of sub.images ?? []) parts.push(renderImage(img), "");
  for (const table of sub.tables ?? []) parts.push(renderTable(table), "");
  for (const block of sub.codeBlocks ?? []) parts.push(renderCodeBlock(block), "");
  return parts.join("\n");
}

function renderChapter(chapter: BookChapter, index: number, depth: number): string {
  const heading = "#".repeat(depth);
  const parts: string[] = [`${heading} ${index}. ${chapter.title}`, ""];
  if (chapter.content) parts.push(chapter.content, "");
  for (const img of chapter.images ?? []) parts.push(renderImage(img), "");
  for (const table of chapter.tables ?? []) parts.push(renderTable(table), "");
  for (const block of chapter.codeBlocks ?? []) parts.push(renderCodeBlock(block), "");
  for (const sub of chapter.subchapters ?? []) parts.push(renderSubchapter(sub, depth + 1));
  return parts.join("\n");
}

function renderToc(chapters: BookChapter[], appendix?: BookChapter[]): string {
  const lines = ["## Table of Contents", ""];
  chapters.forEach((ch, i) => {
    const anchor = `#${(i + 1)}-${ch.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
    lines.push(`${i + 1}. [${ch.title}](${anchor})`);
    for (const sub of ch.subchapters ?? []) {
      const subAnchor = `#${sub.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
      lines.push(`   - [${sub.title}](${subAnchor})`);
    }
  });
  if (appendix?.length) {
    lines.push("", "**Appendix**");
    appendix.forEach((ap, i) => {
      const anchor = `#appendix-${String.fromCharCode(65 + i)}-${ap.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
      lines.push(`- [Appendix ${String.fromCharCode(65 + i)}: ${ap.title}](${anchor})`);
    });
  }
  if (references) {
    lines.push("- [References](#references)");
  }
  return lines.join("\n");
}

// eslint-disable-next-line prefer-const
let references: boolean = false;

export class BookGenerator {
  generate(context: BookContext): BookGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const bookDir = path.join(context.outputDir, "book");
    try {
      fs.mkdirSync(bookDir, { recursive: true });
    } catch (err) {
      errors.push(`failed to create book dir: ${err instanceof Error ? err.message : String(err)}`);
      return { written, errors };
    }

    references = Boolean(context.references?.length);

    const parts: string[] = [];

    // Cover — use template if available, fall back to inline
    const coverTplPath = path.resolve(fileURLToPath(import.meta.url), "../../../templates/book/cover.md.tpl");
    const coverTpl = fs.existsSync(coverTplPath) ? fs.readFileSync(coverTplPath, "utf8") : null;
    if (coverTpl) {
      parts.push(renderTemplate(coverTpl, {
        title: context.title,
        subtitle: context.subtitle ?? "",
        author: context.author,
        date: context.date ?? "",
        description: context.description ?? "",
      }, { stripUnresolved: true }).trim(), "");
    } else {
      parts.push(`# ${context.title}`);
      if (context.subtitle) parts.push(`## ${context.subtitle}`);
      parts.push("", `**Author:** ${context.author}`);
      if (context.date) parts.push(`**Date:** ${context.date}`);
      if (context.description) parts.push("", context.description);
      parts.push("", "---", "");
    }

    // Table of Contents
    parts.push(renderToc(context.chapters, context.appendix), "", "---", "");

    // Chapters
    context.chapters.forEach((ch, i) => {
      parts.push(renderChapter(ch, i + 1, 2), "");
    });

    // Appendix
    if (context.appendix?.length) {
      parts.push("---", "", "# Appendix", "");
      context.appendix.forEach((ap, i) => {
        const label = String.fromCharCode(65 + i);
        const apWithTitle = { ...ap, title: `Appendix ${label}: ${ap.title}` };
        parts.push(renderChapter(apWithTitle, i + 1, 2), "");
      });
    }

    // References
    if (context.references?.length) {
      parts.push("---", "", "## References", "");
      context.references.forEach((ref) => {
        const parts2: string[] = [`[${ref.id}]`];
        if (ref.author) parts2.push(ref.author);
        parts2.push(`*${ref.title}*`);
        if (ref.year) parts2.push(`(${ref.year})`);
        if (ref.url) parts2.push(`<${ref.url}>`);
        parts.push(parts2.join(" "), "");
      });
    }

    const content = parts.join("\n");
    const target = path.join(bookDir, "book.md");
    try {
      fs.writeFileSync(target, content, "utf8");
      written.push(target);
    } catch (err) {
      errors.push(`failed to write book.md: ${err instanceof Error ? err.message : String(err)}`);
    }

    return { written, errors };
  }
}
