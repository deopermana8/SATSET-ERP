import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { IGenerator, GenerationContext, GenerationResult, GeneratorCapability } from "../IGenerator.js";
import { BookGenerator as BookGen } from "../BookGenerator.js";
import { BookTemplateEngine } from "../../templates/books/BookTemplateEngine.js";
import { OutlineGenerator } from "../../books/OutlineGenerator.js";

const TPL_ROOT = path.resolve(fileURLToPath(import.meta.url), "../../../../templates");
function loadTpl(rel: string): string {
  const file = path.join(TPL_ROOT, rel);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

export class BookGeneratorAdapter implements IGenerator {
  static readonly id = "book";
  static readonly generatorName = "Book Generator";
  static readonly staticCapabilities: GeneratorCapability[] = ["ebook", "documentation"];
  static supports(type: string): boolean { return type === "book"; }
  readonly capabilities: GeneratorCapability[] = BookGeneratorAdapter.staticCapabilities;
  supports(type: string): boolean { return BookGeneratorAdapter.supports(type); }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    const outline = new OutlineGenerator().generate(ctx.requirement);
    const bookCtx = new BookTemplateEngine().build("documentation", { title: outline.title, author: "SATSET", outputDir: ctx.outputDir, description: outline.preface });
    bookCtx.chapters = outline.chapters.map((ch) => ({ title: ch.title, content: ch.subchapters.map((s) => `### ${s.title}`).join("\n\n") }));
    const { written, errors } = new BookGen().generate(bookCtx);
    return { success: errors.length === 0, written, errors, summary: `Generated book: ${outline.title}` };
  }
}

export class LandingGeneratorAdapter implements IGenerator {
  static readonly id = "landing";
  static readonly generatorName = "Landing Generator";
  static readonly staticCapabilities: GeneratorCapability[] = ["landing"];
  static supports(type: string): boolean { return type === "landing"; }
  readonly capabilities: GeneratorCapability[] = LandingGeneratorAdapter.staticCapabilities;
  supports(type: string): boolean { return LandingGeneratorAdapter.supports(type); }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    const { renderTemplate } = await import("../../template/TemplateEngine.js");
    const title = ctx.requirement.replace(/^buat\s+/i, "").replace(/^landing page\s+/i, "").trim();
    const featuresHtml = ctx.modules.map((m) => `<div style="padding:1.5rem;background:#f8fafc;border-radius:8px;"><h3>${m}</h3></div>`).join("\n");
    const tpl = loadTpl("landing/index.html.tpl");
    const html = tpl ? renderTemplate(tpl, { title, requirement: ctx.requirement, featuresHtml }) : `<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>${title}</h1></body></html>`;
    const file = path.join(ctx.outputDir, "index.html");
    try { fs.mkdirSync(ctx.outputDir, { recursive: true }); fs.writeFileSync(file, html, "utf8"); return { success: true, written: [file], errors: [], summary: `Generated landing page: ${title}` }; }
    catch (err) { return { success: false, written: [], errors: [err instanceof Error ? err.message : String(err)], summary: "Landing page generation failed" }; }
  }
}

export class HtmlGeneratorAdapter implements IGenerator {
  static readonly id = "website";
  static readonly generatorName = "HTML Generator";
  static readonly staticCapabilities: GeneratorCapability[] = ["website"];
  static supports(type: string): boolean { return type === "website"; }
  readonly capabilities: GeneratorCapability[] = HtmlGeneratorAdapter.staticCapabilities;
  supports(type: string): boolean { return HtmlGeneratorAdapter.supports(type); }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    const title = ctx.requirement.replace(/^buat\s+/i, "").trim();
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title}</title></head><body><nav>${title}</nav><main><h1>${title}</h1><ul>${ctx.modules.map((m) => `<li>${m}</li>`).join("")}</ul></main></body></html>`;
    const file = path.join(ctx.outputDir, "index.html");
    try { fs.mkdirSync(ctx.outputDir, { recursive: true }); fs.writeFileSync(file, html, "utf8"); return { success: true, written: [file], errors: [], summary: `Generated website: ${title}` }; }
    catch (err) { return { success: false, written: [], errors: [err instanceof Error ? err.message : String(err)], summary: "Website generation failed" }; }
  }
}

export class DocumentationGeneratorAdapter implements IGenerator {
  static readonly id = "documentation";
  static readonly generatorName = "Documentation Generator";
  static readonly staticCapabilities: GeneratorCapability[] = ["documentation"];
  static supports(type: string): boolean { return type === "documentation" || type === "cms"; }
  readonly capabilities: GeneratorCapability[] = DocumentationGeneratorAdapter.staticCapabilities;
  supports(type: string): boolean { return DocumentationGeneratorAdapter.supports(type); }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    const outline = new OutlineGenerator().generate(ctx.requirement);
    const bookCtx = new BookTemplateEngine().build("documentation", { title: outline.title, author: "SATSET", outputDir: ctx.outputDir });
    bookCtx.chapters = outline.chapters.map((ch) => ({ title: ch.title, content: ch.subchapters.map((s) => `### ${s.title}\n\nContent for ${s.title}.`).join("\n\n") }));
    const { written, errors } = new BookGen().generate(bookCtx);
    const { HtmlAdapter } = await import("../book/HtmlAdapter.js");
    if (written.length > 0) {
      const md = fs.readFileSync(written[0]!, "utf8");
      const r = await new HtmlAdapter().render(md, outline.title, path.join(ctx.outputDir, "book"));
      return { success: errors.length === 0, written: [...written, r.file], errors: r.error ? [r.error] : errors, summary: `Generated documentation: ${outline.title}` };
    }
    return { success: false, written, errors, summary: "Documentation generation failed" };
  }
}

export class StubGeneratorAdapter implements IGenerator {
  private readonly types: string[];
  readonly capabilities: GeneratorCapability[];
  constructor(...types: string[]) {
    this.types = types;
    this.capabilities = types.filter((t): t is GeneratorCapability =>
      ["app","website","landing","api","mobile","desktop","ebook","documentation"].includes(t)
    );
  }
  supports(type: string): boolean { return this.types.includes(type); }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    const { runFullPipeline } = await import("../FullPipeline.js");
    const report = await runFullPipeline(ctx.requirement, ctx.outputDir);
    return { success: report.success, written: report.written, errors: report.errors, summary: `Generated ${ctx.projectType}: ${report.modules.join(", ")}` };
  }
}

export default [
  new BookGeneratorAdapter(),
  new LandingGeneratorAdapter(),
  new HtmlGeneratorAdapter(),
  new DocumentationGeneratorAdapter(),
  new StubGeneratorAdapter("api", "library", "cli", "plugin"),
] as const;
