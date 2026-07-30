import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { IGenerator, GenerationContext, GenerationResult, GeneratorCapability } from "./IGenerator.js";
import { runFullPipeline } from "./FullPipeline.js";
import { BookGenerator as BookGen } from "./BookGenerator.js";
import { BookTemplateEngine } from "../templates/books/BookTemplateEngine.js";
import { OutlineGenerator } from "../books/OutlineGenerator.js";
import { HtmlAdapter } from "./book/HtmlAdapter.js";
import { renderTemplate } from "../template/TemplateEngine.js";
import { templateStore } from "../templates/TemplateStore.js";
import { DocumentationAutoGenerator } from "./DocumentationAutoGenerator.js";
import { ProjectPlanner } from "../planner/ProjectPlanner.js";
import { parseRequirement } from "../ai/RequirementParser.js";

function loadTpl(rel: string): string {
  const parts = rel.replace(/\.tpl$/, "").split("/");
  const [category, ...rest] = parts;
  return templateStore.get(category ?? "", rest.join("/")) ?? "";
}

// --- Application generator (wraps FullPipeline) ---
class ApplicationGenerator implements IGenerator {
  readonly capabilities: GeneratorCapability[] = ["app", "mobile", "desktop"];
  supports(type: string): boolean {
    return !["book", "landing", "website", "documentation", "api", "library", "cli", "plugin"].includes(type);
  }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    const report = await runFullPipeline(ctx.requirement, ctx.outputDir);
    return { success: report.success, written: report.written, errors: report.errors, summary: `Generated ${report.projectType} application with modules: ${report.modules.join(", ")}` };
  }
}

// --- Book generator (wraps BookGenerator + BookTemplateEngine) ---
class BookGenerator implements IGenerator {
  readonly capabilities: GeneratorCapability[] = ["ebook", "documentation"];
  supports(type: string): boolean { return type === "book"; }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    const outline = new OutlineGenerator().generate(ctx.requirement);
    const bookCtx = new BookTemplateEngine().build("documentation", { title: outline.title, author: "SATSET", outputDir: ctx.outputDir, description: outline.preface });
    bookCtx.chapters = outline.chapters.map((ch) => ({ title: ch.title, content: ch.subchapters.map((s) => `### ${s.title}`).join("\n\n") }));
    const { written, errors } = new BookGen().generate(bookCtx);
    return { success: errors.length === 0, written, errors, summary: `Generated book: ${outline.title}` };
  }
}

// --- Landing page generator ---
class LandingGenerator implements IGenerator {
  readonly capabilities: GeneratorCapability[] = ["landing"];
  supports(type: string): boolean { return type === "landing"; }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    const title = ctx.requirement.replace(/^buat\s+/i, "").replace(/^landing page\s+/i, "").trim();
    const featuresHtml = ctx.modules.map((m) => `<div style="padding:1.5rem;background:#f8fafc;border-radius:8px;"><h3>${m}</h3></div>`).join("\n");
    const tpl = loadTpl("landing/index.html.tpl");
    const html = tpl
      ? renderTemplate(tpl, { title, requirement: ctx.requirement, featuresHtml })
      : `<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>${title}</h1></body></html>`;
    const file = path.join(ctx.outputDir, "index.html");
    try { fs.mkdirSync(ctx.outputDir, { recursive: true }); fs.writeFileSync(file, html, "utf8"); return { success: true, written: [file], errors: [], summary: `Generated landing page: ${title}` }; }
    catch (err) { return { success: false, written: [], errors: [err instanceof Error ? err.message : String(err)], summary: "Landing page generation failed" }; }
  }
}

// --- Website / HTML generator ---
class HtmlGenerator implements IGenerator {
  readonly capabilities: GeneratorCapability[] = ["website"];
  supports(type: string): boolean { return type === "website"; }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    const title = ctx.requirement.replace(/^buat\s+/i, "").trim();
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:system-ui,sans-serif;margin:0}nav{background:#1e293b;color:#fff;padding:1rem 2rem}main{max-width:960px;margin:3rem auto;padding:0 1rem}</style></head><body><nav>${title}</nav><main><h1>${title}</h1><p>${ctx.requirement}</p><ul>${ctx.modules.map((m) => `<li>${m}</li>`).join("")}</ul></main></body></html>`;
    const file = path.join(ctx.outputDir, "index.html");
    try { fs.mkdirSync(ctx.outputDir, { recursive: true }); fs.writeFileSync(file, html, "utf8"); return { success: true, written: [file], errors: [], summary: `Generated website: ${title}` }; }
    catch (err) { return { success: false, written: [], errors: [err instanceof Error ? err.message : String(err)], summary: "Website generation failed" }; }
  }
}

// --- Documentation generator ---
class DocumentationGenerator implements IGenerator {
  readonly capabilities: GeneratorCapability[] = ["documentation"];
  supports(type: string): boolean { return type === "documentation" || type === "cms"; }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    const outline = new OutlineGenerator().generate(ctx.requirement);
    const bookCtx = new BookTemplateEngine().build("documentation", { title: outline.title, author: "SATSET", outputDir: ctx.outputDir });
    bookCtx.chapters = outline.chapters.map((ch) => ({ title: ch.title, content: ch.subchapters.map((s) => `### ${s.title}\n\nContent for ${s.title}.`).join("\n\n") }));
    const { written, errors } = new BookGen().generate(bookCtx);
    if (written.length > 0) {
      const md = fs.readFileSync(written[0]!, "utf8");
      const htmlResult = await new HtmlAdapter().render(md, outline.title, path.join(ctx.outputDir, "book"));
      return { success: errors.length === 0, written: [...written, htmlResult.file], errors: htmlResult.error ? [htmlResult.error] : errors, summary: `Generated documentation: ${outline.title}` };
    }
    return { success: false, written, errors, summary: "Documentation generation failed" };
  }
}

// --- Generic stub for api / library / cli / plugin ---
class StubGenerator implements IGenerator {
  readonly capabilities: GeneratorCapability[];
  constructor(private readonly types: string[]) {
    this.capabilities = types.filter((t): t is GeneratorCapability =>
      ["app","website","landing","api","mobile","desktop","ebook","documentation"].includes(t)
    );
  }
  supports(type: string): boolean { return this.types.includes(type); }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    // Delegate to application pipeline for now
    const report = await runFullPipeline(ctx.requirement, ctx.outputDir);
    return { success: report.success, written: report.written, errors: report.errors, summary: `Generated ${ctx.projectType}: ${report.modules.join(", ")}` };
  }
}

import { GeneratorLoader } from "./GeneratorLoader.js";

const GENERATORS: IGenerator[] = [
  new BookGenerator(),
  new LandingGenerator(),
  new HtmlGenerator(),
  new DocumentationGenerator(),
  new StubGenerator(["api", "library", "cli", "plugin"]),
  new ApplicationGenerator(), // fallback — must be last
];

export class GeneratorRouter {
  private registry: IGenerator[] | null = null;
  private readonly loader = new GeneratorLoader();

  private async ensureRegistry(): Promise<IGenerator[]> {
    if (this.registry) return this.registry;
    try {
      const discovered = await this.loader.load();
      // Ensure fallback (ApplicationGenerator) is last
      const fallback = GENERATORS[GENERATORS.length - 1]!;
      const withoutFallback = discovered.filter((g) => g !== fallback && !g.supports("_fallback_application_"));
      this.registry = [...withoutFallback, fallback];
    } catch {
      this.registry = GENERATORS;
    }
    return this.registry;
  }

  /** Replace the default registry with auto-discovered generators. */
  withRegistry(generators: IGenerator[]): this {
    this.registry = generators;
    return this;
  }

  route(projectType: string): IGenerator {
    const list = this.registry ?? GENERATORS;
    const gen = list.find((g) => g.supports(projectType));
    return gen ?? list[list.length - 1]!;
  }

  async generate(context: GenerationContext): Promise<GenerationResult> {
    const list = await this.ensureRegistry();
    const gen = list.find((g) => g.supports(context.projectType)) ?? list[list.length - 1]!;
    const result = await gen.generate(context);

    // Automatically generate documentation after every generation
    if (context.outputDir) {
      try {
        const parsed = parseRequirement(context.requirement);
        const plan = new ProjectPlanner().plan({ requirement: context.requirement, projectType: parsed.projectType, modules: parsed.modules, outputDir: context.outputDir });
        const docResult = new DocumentationAutoGenerator().generate(plan, context.outputDir);
        result.written.push(...docResult.written);
        result.errors.push(...docResult.errors);
      } catch { /* doc generation failure must not block main generation */ }
    }

    return result;
  }
}
