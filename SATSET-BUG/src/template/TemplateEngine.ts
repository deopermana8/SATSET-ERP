import fs from "node:fs";
import path from "node:path";

export type TemplateVars = Record<string, unknown>;

export interface TemplateEngineOptions {
  /** Strip remaining unresolved {{placeholders}} from output. Default: false */
  stripUnresolved?: boolean;
}

export class TemplateEngine {
  private readonly opts: Required<TemplateEngineOptions>;
  private readonly templates: Map<string, string> = new Map();
  private readonly layouts: Map<string, string> = new Map();

  constructor(opts: TemplateEngineOptions = {}) {
    this.opts = { stripUnresolved: false, ...opts };
  }

  /** Register a named template string. */
  registerTemplate(name: string, template: string): void {
    this.templates.set(name, template);
  }

  /** Scan a directory and register all .tpl files by name (without extension). */
  registerDirectory(dir: string): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const content = fs.readFileSync(path.join(dir, entry.name), "utf8");
      const name = entry.name.replace(/\.tpl$/, "");
      this.templates.set(name, content);
    }
  }

  /** Render a registered partial by name, injecting vars. */
  partial(name: string, vars: TemplateVars = {}): string {
    const tpl = this.templates.get(name);
    if (!tpl) return `<!-- partial:${name} not found -->`;
    return this.render(tpl, vars);
  }

  /** Register a layout template. Layouts use {{content}} as the slot. */
  layout(name: string, template: string): void {
    this.layouts.set(name, template);
  }

  /** Render content inside a named layout. */
  renderWithLayout(layoutName: string, content: string, vars: TemplateVars = {}): string {
    const layoutTpl = this.layouts.get(layoutName);
    if (!layoutTpl) return content;
    return this.render(layoutTpl, { ...vars, content });
  }

  render(template: string, vars: TemplateVars): string {
    let result = template;
    result = this.processEach(result, vars);
    result = this.processIf(result, vars);
    result = this.processVars(result, vars);
    if (this.opts.stripUnresolved) {
      result = result.replace(/\{\{[^}]+\}\}/g, "");
    }
    return result;
  }

  // {{#each items}}...{{this.field}}...{{/each}}
  private processEach(template: string, vars: TemplateVars): string {
    return template.replace(
      /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_match, path: string, body: string) => {
        const arr = this.resolve(path, vars);
        if (!Array.isArray(arr)) return "";
        return arr
          .map((item, index) => {
            let chunk = body;
            // Replace {{this}} or {{this.field}}
            if (typeof item === "object" && item !== null) {
              const itemVars: TemplateVars = { ...vars, this: item, "@index": index, ...this.flattenThis(item as TemplateVars) };
              chunk = this.processIf(chunk, itemVars);
              chunk = this.processVars(chunk, itemVars);
            } else {
              chunk = chunk.replace(/\{\{this\}\}/g, String(item));
              chunk = chunk.replace(/\{\{@index\}\}/g, String(index));
            }
            return chunk;
          })
          .join("");
      }
    );
  }

  // {{#if condition}}...{{else}}...{{/if}}
  private processIf(template: string, vars: TemplateVars): string {
    return template.replace(
      /\{\{#if\s+([\w.!]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
      (_match, condition: string, trueBranch: string, falseBranch = "") => {
        const value = this.evaluateCondition(condition, vars);
        return value ? trueBranch : falseBranch;
      }
    );
  }

  // {{variable}} and {{object.field}}
  private processVars(template: string, vars: TemplateVars): string {
    return template.replace(/\{\{([\w.@]+)\}\}/g, (_match, path: string) => {
      const value = this.resolve(path, vars);
      return value !== undefined && value !== null ? String(value) : _match;
    });
  }

  private resolve(path: string, vars: TemplateVars): unknown {
    const parts = path.split(".");
    let current: unknown = vars;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = (current as TemplateVars)[part];
    }
    return current;
  }

  private evaluateCondition(condition: string, vars: TemplateVars): boolean {
    const negate = condition.startsWith("!");
    const path = negate ? condition.slice(1) : condition;
    const value = this.resolve(path, vars);
    const truthy = Boolean(value) && (Array.isArray(value) ? value.length > 0 : true);
    return negate ? !truthy : truthy;
  }

  private flattenThis(obj: TemplateVars): TemplateVars {
    const result: TemplateVars = {};
    for (const [k, v] of Object.entries(obj)) {
      result[`this.${k}`] = v;
    }
    return result;
  }
}

// Convenience function
export function renderTemplate(template: string, vars: TemplateVars, opts?: TemplateEngineOptions): string {
  return new TemplateEngine(opts).render(template, vars);
}
