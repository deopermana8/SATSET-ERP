import { promises as fs } from "fs";
import path from "path";
import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

interface TypeScriptMetadata {
  exists: boolean;
  version: string | null;
  configExists: boolean;
  configPath: string | null;
  compilerOptions: Record<string, unknown> | null;
  baseUrl: string | null;
  paths: Record<string, unknown> | null;
  strict: boolean | null;
  module: string | null;
  moduleResolution: string | null;
  target: string | null;
  jsx: string | null;
  incremental: boolean | null;
  skipLibCheck: boolean | null;
  resolveJsonModule: boolean | null;
  esModuleInterop: boolean | null;
  allowJs: boolean | null;
  references: unknown[] | null;
  include: string[] | null;
  exclude: string[] | null;
}

export class TypeScriptScanner implements IScanner {
  public readonly name = "TypeScriptScanner";

  public scan(context: Context): void {
    void this.scanAsync(context);
  }

  private async scanAsync(context: Context): Promise<void> {
    const root = context.projectRoot;
    const tsconfigPath = path.join(root, "tsconfig.json");
    const packageJsonPath = path.join(root, "package.json");
    const typescriptPackageJsonPath = path.join(root, "node_modules", "typescript", "package.json");

    const metadata: TypeScriptMetadata = {
      exists: false,
      version: null,
      configExists: false,
      configPath: null,
      compilerOptions: null,
      baseUrl: null,
      paths: null,
      strict: null,
      module: null,
      moduleResolution: null,
      target: null,
      jsx: null,
      incremental: null,
      skipLibCheck: null,
      resolveJsonModule: null,
      esModuleInterop: null,
      allowJs: null,
      references: null,
      include: null,
      exclude: null,
    };

    metadata.exists = await this.fileExists(typescriptPackageJsonPath);

    metadata.configPath = tsconfigPath;
    metadata.configExists = await this.fileExists(tsconfigPath);

    if (metadata.configExists) {
      try {
        const configContent = await fs.readFile(tsconfigPath, "utf-8");
        const parsedConfig = JSON.parse(configContent) as {
          compilerOptions?: Record<string, unknown>;
          references?: unknown[];
          include?: string[];
          exclude?: string[];
        };

        const compilerOptions = parsedConfig.compilerOptions ?? {};
        metadata.compilerOptions = parsedConfig.compilerOptions ?? null;
        metadata.baseUrl = typeof compilerOptions.baseUrl === "string" ? compilerOptions.baseUrl : null;
        metadata.paths = typeof compilerOptions.paths === "object" && compilerOptions.paths !== null ? compilerOptions.paths as Record<string, unknown> : null;
        metadata.strict = typeof compilerOptions.strict === "boolean" ? compilerOptions.strict : null;
        metadata.module = typeof compilerOptions.module === "string" ? compilerOptions.module : null;
        metadata.moduleResolution = typeof compilerOptions.moduleResolution === "string" ? compilerOptions.moduleResolution : null;
        metadata.target = typeof compilerOptions.target === "string" ? compilerOptions.target : null;
        metadata.jsx = typeof compilerOptions.jsx === "string" ? compilerOptions.jsx : null;
        metadata.incremental = typeof compilerOptions.incremental === "boolean" ? compilerOptions.incremental : null;
        metadata.skipLibCheck = typeof compilerOptions.skipLibCheck === "boolean" ? compilerOptions.skipLibCheck : null;
        metadata.resolveJsonModule = typeof compilerOptions.resolveJsonModule === "boolean" ? compilerOptions.resolveJsonModule : null;
        metadata.esModuleInterop = typeof compilerOptions.esModuleInterop === "boolean" ? compilerOptions.esModuleInterop : null;
        metadata.allowJs = typeof compilerOptions.allowJs === "boolean" ? compilerOptions.allowJs : null;
        metadata.references = Array.isArray(parsedConfig.references) ? parsedConfig.references : null;
        metadata.include = Array.isArray(parsedConfig.include) ? parsedConfig.include : null;
        metadata.exclude = Array.isArray(parsedConfig.exclude) ? parsedConfig.exclude : null;
      } catch {
        metadata.configExists = false;
        metadata.configPath = null;
      }
    }

    if (await this.fileExists(packageJsonPath)) {
      try {
        const packageContent = await fs.readFile(packageJsonPath, "utf-8");
        const parsedPackage = JSON.parse(packageContent) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
        };

        metadata.version =
          parsedPackage.dependencies?.typescript ??
          parsedPackage.devDependencies?.typescript ??
          metadata.version;
      } catch {
        // Ignore package.json parse failure.
      }
    }

    if (metadata.exists) {
      try {
        const typescriptPackageContent = await fs.readFile(typescriptPackageJsonPath, "utf-8");
        const parsedTypescriptPackage = JSON.parse(typescriptPackageContent) as {
          version?: string;
        };

        metadata.version = parsedTypescriptPackage.version ?? metadata.version;
      } catch {
        metadata.exists = false;
      }
    }

    (context.metadata as Record<string, unknown>)["typescript"] = metadata;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
