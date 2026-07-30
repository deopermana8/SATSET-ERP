import path from "node:path";
import fs from "node:fs";
import { BookGenerator, type BookContext, type BookChapter, type BookReference } from "../generator/BookGenerator.js";
import { BookTemplateEngine, type BookTemplateName } from "../templates/books/BookTemplateEngine.js";
import { MarkdownAdapter } from "../generator/book/MarkdownAdapter.js";
import { HtmlAdapter } from "../generator/book/HtmlAdapter.js";

export interface BookRequirement {
  title: string;
  author: string;
  subject: string;
  template: BookTemplateName;
  outputDir: string;
  date?: string;
  exportFormats?: Array<"markdown" | "html">;
}

export interface OutlineSection {
  title: string;
  description: string;
}

export interface ChapterPlan {
  index: number;
  title: string;
  sections: string[];
}

export interface BookPipelineResult {
  success: boolean;
  written: string[];
  errors: string[];
  outline: OutlineSection[];
  chapters: ChapterPlan[];
}

// Stage 1: Generate outline from requirement
function generateOutline(req: BookRequirement): OutlineSection[] {
  const engine = new BookTemplateEngine();
  const ctx = engine.build(req.template, { title: req.title, author: req.author, outputDir: req.outputDir, date: req.date, description: req.subject });
  return ctx.chapters.map((ch) => ({ title: ch.title, description: ch.content ?? "" }));
}

// Stage 2: Plan chapters with sections
function planChapters(outline: OutlineSection[]): ChapterPlan[] {
  return outline.map((sec, i) => ({
    index: i + 1,
    title: sec.title,
    sections: [sec.description.slice(0, 60) || `${sec.title} overview`],
  }));
}

// Stage 3: Generate chapter content
function generateChapters(plans: ChapterPlan[]): BookChapter[] {
  return plans.map((plan) => ({
    title: plan.title,
    content: plan.sections.join("\n\n"),
  }));
}

// Stage 4: Generate references
function generateReferences(req: BookRequirement): BookReference[] {
  return [
    { id: "REF001", title: `${req.subject} — Primary Reference`, author: req.author, year: new Date().getFullYear() },
  ];
}

// Stage 5: Assemble full BookContext
function assembleBook(req: BookRequirement, chapters: BookChapter[], references: BookReference[]): BookContext {
  const engine = new BookTemplateEngine();
  const base = engine.build(req.template, { title: req.title, author: req.author, outputDir: req.outputDir, date: req.date, description: req.subject });
  return { ...base, chapters, references };
}

// Stage 6: Export in requested formats
async function exportBook(ctx: BookContext, formats: Array<"markdown" | "html">, outputDir: string): Promise<{ written: string[]; errors: string[] }> {
  const generator = new BookGenerator();
  const { written: mdFiles, errors: mdErrors } = generator.generate(ctx);
  const written = [...mdFiles];
  const errors = [...mdErrors];

  const markdown = mdFiles.length > 0 ? fs.readFileSync(mdFiles[0]!, "utf8") : "";

  const adapters = { markdown: new MarkdownAdapter(), html: new HtmlAdapter() };
  const bookOutputDir = path.join(outputDir, "book");

  for (const fmt of formats) {
    if (fmt === "markdown") continue; // already written by BookGenerator
    const adapter = adapters[fmt];
    if (!adapter) continue;
    const result = await adapter.render(markdown, ctx.title, bookOutputDir);
    if (result.error) errors.push(result.error);
    else written.push(result.file);
  }

  return { written, errors };
}

export class BookPipeline {
  async run(req: BookRequirement): Promise<BookPipelineResult> {
    const written: string[] = [];
    const errors: string[] = [];

    const formats = req.exportFormats ?? ["markdown"];

    // Pipeline stages
    const outline = generateOutline(req);
    const plans = planChapters(outline);
    const chapters = generateChapters(plans);
    const references = generateReferences(req);
    const ctx = assembleBook(req, chapters, references);

    const exportResult = await exportBook(ctx, formats, req.outputDir);
    written.push(...exportResult.written);
    errors.push(...exportResult.errors);

    return { success: errors.length === 0, written, errors, outline, chapters: plans };
  }
}
