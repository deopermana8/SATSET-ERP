import { promises as fs } from "fs";
import path from "path";
import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

interface ReactMetadata {
  exists: boolean;
  reactVersion: string | null;
  reactDomVersion: string | null;
  jsxRuntime: string | null;
  strictMode: boolean | null;
  reactCompiler: string | null;
  serverComponents: boolean | null;
  clientComponents: boolean | null;
  hooksDetected: boolean | null;
}

export class ReactScanner implements IScanner {
  public readonly name = "ReactScanner";

  public scan(context: Context): void {
    void this.scanAsync(context);
  }

  private async scanAsync(context: Context): Promise<void> {
    const root = context.projectRoot;
    const packageJsonPath = path.join(root, "package.json");

    const metadata: ReactMetadata = {
      exists: false,
      reactVersion: null,
      reactDomVersion: null,
      jsxRuntime: null,
      strictMode: null,
      reactCompiler: null,
      serverComponents: null,
      clientComponents: null,
      hooksDetected: null,
    };

    if (!(await this.fileExists(packageJsonPath))) {
      (context.metadata as Record<string, unknown>)["react"] = metadata;
      return;
    }

    metadata.exists = true;

    try {
      const content = await fs.readFile(packageJsonPath, "utf-8");
      const parsedPackage = JSON.parse(content) as Record<string, unknown>;
      const dependencies = parsedPackage.dependencies as Record<string, unknown> | undefined;
      const devDependencies = parsedPackage.devDependencies as Record<string, unknown> | undefined;
      const allDeps = { ...dependencies, ...devDependencies } as Record<string, unknown> | undefined;

      const reactVersion = allDeps?.react;
      const reactDomVersion = allDeps?.["react-dom"];

      metadata.reactVersion = typeof reactVersion === "string" ? reactVersion : null;
      metadata.reactDomVersion = typeof reactDomVersion === "string" ? reactDomVersion : null;

      metadata.jsxRuntime = typeof parsedPackage.jsxRuntime === "string" ? parsedPackage.jsxRuntime : null;
      metadata.strictMode = this.extractBoolean(parsedPackage.strictMode);
      metadata.reactCompiler = typeof parsedPackage.reactCompiler === "string" ? parsedPackage.reactCompiler : null;

      const scripts = parsedPackage.scripts as Record<string, string> | undefined;
      metadata.serverComponents = this.detectServerComponents(scripts);
      metadata.clientComponents = this.detectClientComponents(scripts);
      metadata.hooksDetected = this.detectHooks(parsedPackage);
    } catch {
      metadata.exists = false;
    }

    (context.metadata as Record<string, unknown>)["react"] = metadata;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private extractBoolean(value: unknown): boolean | null {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      if (normalized === "true") {
        return true;
      }
      if (normalized === "false") {
        return false;
      }
    }
    return null;
  }

  private detectServerComponents(scripts: Record<string, string> | undefined): boolean | null {
    if (!scripts) {
      return null;
    }

    return Object.values(scripts).some((script) => /server|next build|next dev|next start/i.test(script));
  }

  private detectClientComponents(scripts: Record<string, string> | undefined): boolean | null {
    if (!scripts) {
      return null;
    }

    return Object.values(scripts).some((script) => /client|react-scripts|vite|next dev|next build/i.test(script));
  }

  private detectHooks(parsedPackage: Record<string, unknown>): boolean | null {
    const keywords = parsedPackage.keywords as unknown;
    if (Array.isArray(keywords)) {
      return keywords.some((keyword) => typeof keyword === "string" && /react|hooks/i.test(keyword));
    }
    return null;
  }
}
