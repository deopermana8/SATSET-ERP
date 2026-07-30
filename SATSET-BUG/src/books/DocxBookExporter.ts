import path from "node:path";
import { BookGenerator, type BookContext } from "../generator/BookGenerator.js";
import { DocxAdapter } from "../generator/book/DocxAdapter.js";
import fs from "node:fs";

export interface DocxBookExportResult {
  file: string;
  success: boolean;
  error?: string;
}

export class DocxBookExporter {
  private readonly adapter = new DocxAdapter();

  async export(ctx: BookContext): Promise<DocxBookExportResult> {
    // Step 1: generate markdown via BookGenerator
    const generator = new BookGenerator();
    const { written, errors } = generator.generate(ctx);

    if (errors.length > 0) {
      return { file: "", success: false, error: errors.join("; ") };
    }

    const mdFile = written[0];
    if (!mdFile) {
      return { file: "", success: false, error: "BookGenerator produced no output" };
    }

    // Step 2: read the markdown
    let markdown: string;
    try {
      markdown = fs.readFileSync(mdFile, "utf8");
    } catch (err) {
      return { file: "", success: false, error: err instanceof Error ? err.message : String(err) };
    }

    // Step 3: export to RTF/DOCX via DocxAdapter
    const outputDir = path.join(ctx.outputDir, "book");
    const result = await this.adapter.render(markdown, ctx.title, outputDir);

    if (result.error) {
      return { file: result.file, success: false, error: result.error };
    }

    return { file: result.file, success: true };
  }
}
