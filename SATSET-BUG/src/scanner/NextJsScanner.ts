import { promises as fs } from "fs";
import path from "path";
import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

interface NextMetadata {
  exists: boolean;
  version: string | null;
  configExists: boolean;
  configPath: string | null;
  appRouter: boolean | null;
  pagesRouter: boolean | null;
  turbopack: boolean | null;
  typescript: boolean | null;
  eslint: boolean | null;
  reactVersion: string | null;
  nextVersion: string | null;
  output: string | null;
  images: string | null;
  experimental: string | null;
}

export class NextJsScanner implements IScanner {
  public readonly name = "NextJsScanner";

  public scan(context: Context): void {
    void this.scanAsync(context);
  }

  private async scanAsync(context: Context): Promise<void> {
    const root = context.projectRoot;
    const packageJsonPath = path.join(root, "package.json");
    const configCandidates = [
      path.join(root, "next.config.js"),
      path.join(root, "next.config.mjs"),
      path.join(root, "next.config.ts"),
    ];

    const metadata: NextMetadata = {
      exists: false,
      version: null,
      configExists: false,
      configPath: null,
      appRouter: null,
      pagesRouter: null,
      turbopack: null,
      typescript: null,
      eslint: null,
      reactVersion: null,
      nextVersion: null,
      output: null,
      images: null,
      experimental: null,
    };

    const configPath = await this.findFirstExistingPath(configCandidates);
    metadata.configExists = configPath !== null;
    metadata.configPath = configPath;

    const appDirExists = await this.fileExists(path.join(root, "app"));
    const pagesDirExists = await this.fileExists(path.join(root, "pages"));
    metadata.appRouter = appDirExists && !pagesDirExists ? true : appDirExists ? true : false;
    metadata.pagesRouter = pagesDirExists && !appDirExists ? true : pagesDirExists ? true : false;

    if (await this.fileExists(packageJsonPath)) {
      try {
        const packageContent = await fs.readFile(packageJsonPath, "utf-8");
        const parsed = JSON.parse(packageContent) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
          scripts?: Record<string, string>;
        };

        const deps = { ...parsed.dependencies, ...parsed.devDependencies } as Record<string, string> | undefined;
        metadata.nextVersion = deps?.next ?? null;
        metadata.reactVersion = deps?.react ?? null;
        metadata.typescript = deps?.typescript !== undefined ? true : null;
        metadata.eslint = deps?.eslint !== undefined ? true : null;

        if (metadata.eslint === null && parsed.scripts) {
          metadata.eslint = Object.values(parsed.scripts).some((script) => typeof script === "string" && script.includes("next lint"));
        }

        metadata.exists = metadata.nextVersion !== null;
      } catch {
        metadata.exists = false;
      }
    }

    if (configPath) {
      try {
        const configContent = await fs.readFile(configPath, "utf-8");
        metadata.output = this.extractString(configContent, "output");
        metadata.images = this.extractRawBlock(configContent, "images");
        metadata.experimental = this.extractRawBlock(configContent, "experimental");
        metadata.turbopack = this.extractBoolean(configContent, "turbopack") ?? this.extractBoolean(configContent, "experimental.turbopack");

        if (metadata.appRouter === null) {
          metadata.appRouter = this.extractBoolean(configContent, "appDir") ?? null;
        }

        if (metadata.pagesRouter === null) {
          metadata.pagesRouter = this.extractBoolean(configContent, "pagesDir") ?? null;
        }
      } catch {
        metadata.configExists = metadata.configExists;
      }
    }

    (context.metadata as Record<string, unknown>)["next"] = metadata;
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

  private extractString(content: string, key: string): string | null {
    const match = content.match(new RegExp(`${key}\s*:\s*("([^"]*)"|'([^']*)'|` + "([^,\n\r}]+)" + ")", "i"));
    if (!match) {
      return null;
    }

    const value = match[2] ?? match[3] ?? match[4] ?? null;
    return value !== null ? String(value).trim().replace(/['"]$/u, "") : null;
  }

  private extractBoolean(content: string, key: string): boolean | null {
    const match = content.match(new RegExp(`${key}\s*:\s*(true|false)`, "i"));
    if (!match) {
      return null;
    }

    return match[1].toLowerCase() === "true";
  }

  private extractRawBlock(content: string, key: string): string | null {
    const regex = new RegExp(`${key}\s*:\s*(\{[\s\S]*?\})`, "i");
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  }
}
