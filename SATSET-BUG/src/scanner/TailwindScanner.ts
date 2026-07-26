import { promises as fs } from "fs";
import path from "path";
import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

interface TailwindMetadata {
  exists: boolean;
  version: string | null;
  configExists: boolean;
  configPath: string | null;
  postcssExists: boolean;
  postcssPath: string | null;
  plugins: string[] | null;
  content: unknown | null;
  theme: unknown | null;
  presets: unknown | null;
  darkMode: unknown | null;
  usesTailwindV4: boolean | null;
  cssEntryDetected: boolean | null;
}

export class TailwindScanner implements IScanner {
  public readonly name = "TailwindScanner";

  public scan(context: Context): void {
    void this.scanAsync(context);
  }

  private async scanAsync(context: Context): Promise<void> {
    const root = context.projectRoot;
    const packageJsonPath = path.join(root, "package.json");
    const configCandidates = [
      path.join(root, "tailwind.config.js"),
      path.join(root, "tailwind.config.ts"),
      path.join(root, "tailwind.config.cjs"),
    ];
    const postcssCandidates = [
      path.join(root, "postcss.config.js"),
      path.join(root, "postcss.config.cjs"),
      path.join(root, "postcss.config.mjs"),
    ];

    const metadata: TailwindMetadata = {
      exists: false,
      version: null,
      configExists: false,
      configPath: null,
      postcssExists: false,
      postcssPath: null,
      plugins: null,
      content: null,
      theme: null,
      presets: null,
      darkMode: null,
      usesTailwindV4: null,
      cssEntryDetected: null,
    };

    const configPath = await this.findFirstExistingPath(configCandidates);
    metadata.configExists = configPath !== null;
    metadata.configPath = configPath;

    const postcssPath = await this.findFirstExistingPath(postcssCandidates);
    metadata.postcssExists = postcssPath !== null;
    metadata.postcssPath = postcssPath;

    if (await this.fileExists(packageJsonPath)) {
      metadata.exists = true;
      try {
        const packageContent = await fs.readFile(packageJsonPath, "utf-8");
        const parsed = JSON.parse(packageContent) as {
          dependencies?: Record<string, unknown>;
          devDependencies?: Record<string, unknown>;
        };
        const deps = {
          ...(parsed.dependencies ?? {}),
          ...(parsed.devDependencies ?? {}),
        } as Record<string, unknown>;
        const version = deps.tailwindcss;
        metadata.version = typeof version === "string" ? version : null;
      } catch {
        metadata.version = null;
      }
    }

    if (configPath) {
      try {
        const content = await fs.readFile(configPath, "utf-8");
        metadata.usesTailwindV4 = /tailwindcss\s*:\s*\{[\s\S]*?\b(?:content|theme|plugins|presets)\b/iu.test(content);
        metadata.plugins = this.extractArray(content, "plugins");
        metadata.content = this.extractObject(content, "content");
        metadata.theme = this.extractObject(content, "theme");
        metadata.presets = this.extractArray(content, "presets");
        metadata.darkMode = this.extractValue(content, "darkMode");
      } catch {
        metadata.configExists = metadata.configExists;
      }
    }

    metadata.cssEntryDetected = await this.detectCssEntry(root);

    (context.metadata as Record<string, unknown>)["tailwind"] = metadata;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async findFirstExistingPath(paths: string[]): Promise<string | null> {
    for (const candidate of paths) {
      if (await this.fileExists(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  private extractArray(content: string, key: string): string[] | null {
    const match = content.match(new RegExp(`${key}\s*:\s*\[(.*?)\]`, "is"));
    if (!match) {
      return null;
    }

    return match[1]
      .split(/,(?![^\[\]]*\])/)
      .map((item) => item.trim().replace(/^['\"]|['\"]$/g, ""))
      .filter(Boolean);
  }

  private extractObject(content: string, key: string): unknown | null {
    const match = content.match(new RegExp(`${key}\s*:\s*(\{[\s\S]*?\})`, "is"));
    if (!match) {
      return null;
    }

    try {
      return this.parsePartialObject(match[1]);
    } catch {
      return null;
    }
  }

  private extractValue(content: string, key: string): unknown | null {
    const match = content.match(new RegExp(`${key}\s*:\s*([^,\n}]+)`, "i"));
    if (!match) {
      return null;
    }

    const value = match[1].trim();
    if (/^['\"]/.test(value)) {
      return value.replace(/^['\"]|['\"]$/g, "");
    }

    if (/^(true|false)$/i.test(value)) {
      return value.toLowerCase() === "true";
    }

    return value;
  }

  private parsePartialObject(value: string): unknown {
    const jsonLike = value
      .replace(/([\w$]+)\s*:/g, '"$1":')
      .replace(/'/g, '"');
    return JSON.parse(jsonLike);
  }

  private async detectCssEntry(root: string): Promise<boolean> {
    const candidates = [
      path.join(root, "src", "styles", "globals.css"),
      path.join(root, "src", "styles", "tailwind.css"),
      path.join(root, "styles", "globals.css"),
      path.join(root, "styles", "tailwind.css"),
      path.join(root, "src", "index.css"),
      path.join(root, "src", "app", "globals.css"),
    ];

    for (const candidate of candidates) {
      if (await this.fileExists(candidate)) {
        return true;
      }
    }

    return false;
  }
}
