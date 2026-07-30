import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_TEMPLATES = path.resolve(fileURLToPath(import.meta.url), "../../../templates");

export type TemplateCategory = "react" | "next" | "prisma" | "landing" | "book" | "node" | "common";

export interface TemplateEntry {
  name: string;
  category: TemplateCategory | string;
  path: string;
}

export class TemplateStore {
  private readonly baseDir: string;
  private readonly cache: Map<string, string> = new Map();

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? ROOT_TEMPLATES;
  }

  /** Read a template by category and name (e.g. "react", "App.tsx"). */
  get(category: string, name: string): string | undefined {
    const key = `${category}/${name}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const candidates = [
      path.join(this.baseDir, category, name),
      path.join(this.baseDir, category, `${name}.tpl`),
      path.join(this.baseDir, name),
      path.join(this.baseDir, `${name}.tpl`),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        const content = fs.readFileSync(candidate, "utf8");
        this.cache.set(key, content);
        return content;
      }
    }
    return undefined;
  }

  /** List all templates in a category. */
  list(category: string): TemplateEntry[] {
    const dir = path.join(this.baseDir, category);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter((f) => !fs.statSync(path.join(dir, f)).isDirectory())
      .map((f) => ({
        name: f.replace(/\.tpl$/, ""),
        category,
        path: path.join(dir, f),
      }));
  }

  /** List all available categories (top-level directories). */
  categories(): string[] {
    if (!fs.existsSync(this.baseDir)) return [];
    return fs.readdirSync(this.baseDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  }

  /** Register an in-memory template (bypasses filesystem). */
  register(category: string, name: string, content: string): void {
    this.cache.set(`${category}/${name}`, content);
  }

  /** Clear the internal cache. */
  clearCache(): void {
    this.cache.clear();
  }
}

/** Singleton instance backed by the root templates/ directory. */
export const templateStore = new TemplateStore();
