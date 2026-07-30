import fs from "node:fs";
import path from "node:path";

export interface MdTable {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface MdImage {
  alt: string;
  src?: string;
  caption?: string;
  width?: number;
}

export interface MdCodeBlock {
  language: string;
  code: string;
  caption?: string;
}

export interface MdFootnote {
  id: string;
  text: string;
}

export interface MdQuote {
  text: string;
  attribution?: string;
}

export interface MdChecklistItem {
  label: string;
  checked?: boolean;
}

export interface MdSection {
  title: string;
  level: 1 | 2 | 3 | 4;
  content?: string;
  tables?: MdTable[];
  images?: MdImage[];
  codeBlocks?: MdCodeBlock[];
  footnotes?: MdFootnote[];
  quotes?: MdQuote[];
  checklists?: MdChecklistItem[][];
  subsections?: MdSection[];
}

export interface MdBookInput {
  title: string;
  author: string;
  date?: string;
  description?: string;
  sections: MdSection[];
  footnotes?: MdFootnote[];
  outputDir: string;
  filename?: string;
}

export interface MdBookGenerateResult {
  written: string[];
  errors: string[];
}

// --- Renderers ---

function renderTable(t: MdTable): string {
  const lines: string[] = [];
  lines.push(`| ${t.headers.join(" | ")} |`);
  lines.push(`| ${t.headers.map(() => "---").join(" | ")} |`);
  for (const row of t.rows) lines.push(`| ${row.join(" | ")} |`);
  if (t.caption) lines.push(``, `*${t.caption}*`);
  return lines.join("\n");
}

function renderImage(img: MdImage): string {
  const src = img.src ?? `images/${img.alt.toLowerCase().replace(/\s+/g, "-")}.png`;
  const sizeHint = img.width ? ` <!-- width: ${img.width}px -->` : "";
  const lines = [`![${img.alt}](${src})${sizeHint}`];
  if (img.caption) lines.push(`*Figure: ${img.caption}*`);
  return lines.join("\n");
}

function renderCodeBlock(cb: MdCodeBlock): string {
  const lines = [`\`\`\`${cb.language}`, cb.code, "```"];
  if (cb.caption) lines.push(`*${cb.caption}*`);
  return lines.join("\n");
}

function renderQuote(q: MdQuote): string {
  const lines = q.text.split("\n").map((l) => `> ${l}`);
  if (q.attribution) lines.push(`>`, `> — *${q.attribution}*`);
  return lines.join("\n");
}

function renderChecklist(items: MdChecklistItem[]): string {
  return items.map((item) => `- [${item.checked ? "x" : " "}] ${item.label}`).join("\n");
}

function renderFootnote(fn: MdFootnote): string {
  return `[^${fn.id}]: ${fn.text}`;
}

function renderSection(sec: MdSection, noteRefs: Set<string>): string {
  const heading = "#".repeat(sec.level);
  const parts: string[] = [`${heading} ${sec.title}`, ""];

  if (sec.content) parts.push(sec.content, "");
  for (const q of sec.quotes ?? []) parts.push(renderQuote(q), "");
  for (const img of sec.images ?? []) parts.push(renderImage(img), "");
  for (const t of sec.tables ?? []) parts.push(renderTable(t), "");
  for (const cb of sec.codeBlocks ?? []) parts.push(renderCodeBlock(cb), "");
  for (const cl of sec.checklists ?? []) parts.push(renderChecklist(cl), "");
  for (const fn of sec.footnotes ?? []) {
    noteRefs.add(fn.id);
    parts.push(`[^${fn.id}]`, "");
  }
  for (const sub of sec.subsections ?? []) parts.push(renderSection(sub, noteRefs));

  return parts.join("\n");
}

function renderToc(sections: MdSection[]): string {
  const lines = ["## Table of Contents", ""];
  const visit = (secs: MdSection[], depth: number): void => {
    for (const sec of secs) {
      const indent = "  ".repeat(depth);
      const anchor = sec.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      lines.push(`${indent}- [${sec.title}](#${anchor})`);
      if (sec.subsections?.length) visit(sec.subsections, depth + 1);
    }
  };
  visit(sections.filter((s) => s.level <= 2), 0);
  return lines.join("\n");
}

export class MarkdownBookGenerator {
  generate(input: MdBookInput): MdBookGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const noteRefs = new Set<string>();
    const parts: string[] = [];

    // Cover
    parts.push(`# ${input.title}`);
    if (input.description) parts.push(``, `*${input.description}*`);
    parts.push(``, `**Author:** ${input.author}`);
    if (input.date) parts.push(`**Date:** ${input.date}`);
    parts.push(``, `---`, ``);

    // TOC
    parts.push(renderToc(input.sections), ``, `---`, ``);

    // Sections
    for (const sec of input.sections) {
      parts.push(renderSection(sec, noteRefs), "");
    }

    // Footnotes
    const allFootnotes = [
      ...(input.footnotes ?? []),
      ...input.sections.flatMap((s) => s.footnotes ?? []),
    ].filter((fn) => noteRefs.has(fn.id));

    if (allFootnotes.length > 0) {
      parts.push(`---`, ``, ...allFootnotes.map(renderFootnote), ``);
    }

    const content = parts.join("\n");
    const filename = (input.filename ?? input.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) + ".md";
    const target = path.join(input.outputDir, filename);

    try {
      fs.mkdirSync(input.outputDir, { recursive: true });
      fs.writeFileSync(target, content, "utf8");
      written.push(target);
    } catch (err) {
      errors.push(`failed to write ${filename}: ${err instanceof Error ? err.message : String(err)}`);
    }

    return { written, errors };
  }
}
