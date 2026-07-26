import { promises as fs } from "fs";
import path from "path";
import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

interface TurboMetadata {
  exists: boolean;
  configExists: boolean;
  configPath: string | null;
  pipeline: Record<string, unknown> | null;
  tasks: Record<string, unknown> | null;
  globalDependencies: string[] | null;
  globalEnv: Record<string, string> | null;
  remoteCache: Record<string, unknown> | null;
  outputs: string[] | null;
  cache: Record<string, unknown> | null;
  persistentTasks: string[] | null;
  packageManager: string | null;
}

export class TurboScanner implements IScanner {
  public readonly name = "TurboScanner";

  public scan(context: Context): void {
    void this.scanAsync(context);
  }

  private async scanAsync(context: Context): Promise<void> {
    const root = context.projectRoot;
    const packageJsonPath = path.join(root, "package.json");
    const configCandidates = [path.join(root, "turbo.json"), path.join(root, "turbo.jsonc")];

    const metadata: TurboMetadata = {
      exists: false,
      configExists: false,
      configPath: null,
      pipeline: null,
      tasks: null,
      globalDependencies: null,
      globalEnv: null,
      remoteCache: null,
      outputs: null,
      cache: null,
      persistentTasks: null,
      packageManager: null,
    };

    const configPath = await this.findFirstExistingPath(configCandidates);
    metadata.configExists = configPath !== null;
    metadata.configPath = configPath;

    if (await this.fileExists(packageJsonPath)) {
      metadata.exists = true;
      try {
        const packageContent = await fs.readFile(packageJsonPath, "utf-8");
        const parsedPackage = JSON.parse(packageContent) as Record<string, unknown>;
        const packageManagerValue = parsedPackage.packageManager;
        if (typeof packageManagerValue === "string") {
          metadata.packageManager = packageManagerValue.split("@")[0] ?? packageManagerValue;
        }
      } catch {
        metadata.packageManager = null;
      }
    }

    if (configPath) {
      try {
        const configContent = await fs.readFile(configPath, "utf-8");
        const parsedConfig = this.parseJsonc(configContent);

        metadata.pipeline = typeof parsedConfig.pipeline === "object" && parsedConfig.pipeline !== null ? parsedConfig.pipeline as Record<string, unknown> : null;
        metadata.tasks = typeof parsedConfig.tasks === "object" && parsedConfig.tasks !== null ? parsedConfig.tasks as Record<string, unknown> : null;
        metadata.globalDependencies = Array.isArray(parsedConfig.globalDependencies) ? parsedConfig.globalDependencies.map(String) : null;
        metadata.globalEnv = this.extractStringMap(parsedConfig.globalEnv);
        metadata.remoteCache = typeof parsedConfig.remoteCache === "object" && parsedConfig.remoteCache !== null ? parsedConfig.remoteCache as Record<string, unknown> : null;
        metadata.outputs = Array.isArray(parsedConfig.outputs) ? parsedConfig.outputs.map(String) : null;
        metadata.cache = typeof parsedConfig.cache === "object" && parsedConfig.cache !== null ? parsedConfig.cache as Record<string, unknown> : null;
        metadata.persistentTasks = Array.isArray(parsedConfig.persistentTasks) ? parsedConfig.persistentTasks.map(String) : null;
        metadata.exists = true;
      } catch {
        metadata.configExists = false;
        metadata.configPath = null;
      }
    }

    (context.metadata as Record<string, unknown>)["turbo"] = metadata;
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

  private parseJsonc(content: string): Record<string, unknown> {
    const withoutComments = content
      .replace(/\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "");

    return JSON.parse(withoutComments);
  }

  private extractStringMap(value: unknown): Record<string, string> | null {
    if (typeof value !== "object" || value === null) {
      return null;
    }

    const result: Record<string, string> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (typeof entry === "string") {
        result[key] = entry;
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  }
}
