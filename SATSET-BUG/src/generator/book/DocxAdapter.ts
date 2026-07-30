import fs from "node:fs";
import path from "node:path";
import type { BookRenderAdapter } from "./BookRenderAdapter.js";

/**
 * DocxAdapter — outputs an RTF file readable by Word/LibreOffice.
 * Full DOCX generation requires the `docx` npm package at runtime;
 * this adapter outputs RTF without external dependencies.
 */
export class DocxAdapter implements BookRenderAdapter {
  readonly format = "docx";

  async render(markdown: string, title: string, outputDir: string): Promise<{ file: string; error?: string }> {
    const file = path.join(outputDir, `${sanitize(title)}.rtf`);
    try {
      fs.mkdirSync(outputDir, { recursive: true });
      const rtf = markdownToRtf(title, markdown);
      fs.writeFileSync(file, rtf, "utf8");
      return { file };
    } catch (err) {
      return { file, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

function sanitize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 80) || "book";
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}");
}

function markdownToRtf(title: string, md: string): string {
  const lines = md.split("\n");
  const rtfLines: string[] = [
    "{\\rtf1\\ansi\\deff0",
    "{\\fonttbl{\\f0 Times New Roman;}{\\f1 Courier New;}}",
    `{\\title ${esc(title)}}`,
  ];

  for (const line of lines) {
    if (line.startsWith("# ")) {
      rtfLines.push(`\\f0\\fs36\\b ${esc(line.slice(2))}\\b0\\fs24\\par`);
    } else if (line.startsWith("## ")) {
      rtfLines.push(`\\f0\\fs30\\b ${esc(line.slice(3))}\\b0\\fs24\\par`);
    } else if (line.startsWith("### ")) {
      rtfLines.push(`\\f0\\fs26\\b ${esc(line.slice(4))}\\b0\\fs24\\par`);
    } else if (line === "---") {
      rtfLines.push("\\brdrb\\brdrs\\brdrw10 \\par");
    } else if (line.startsWith("```")) {
      rtfLines.push("\\f1\\fs20");
    } else {
      rtfLines.push(`\\f0\\fs24 ${esc(line)}\\par`);
    }
  }

  rtfLines.push("}");
  return rtfLines.join("\n");
}
