import { promises as fs } from "fs";
import path from "path";
import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

interface PnpmMetadata {
  exists: boolean;
  workspaceExists: boolean;
  workspaceFile: string | null;
  lockfileExists: boolean;
  lockfileVersion: string | null;
  packageManager: string | null;
  workspacePackages: string[] | null;
  catalogs: string[] | null;
  onlyBuiltDependencies: boolean | null;
  patchedDependencies: Record<string, unknown> | null;
  overrides: Record<string, unknown> | null;
  peerDependencyRules: Record<string, unknown> | null;
  registries: Record<string, unknown> | null;
  packageCount: number | null;
  workspaceGlobs: string[] | null;
}

export class PnpmWorkspaceScanner implements IScanner {
  public readonly name = "PnpmWorkspaceScanner";

  public scan(context: Context): void {
    void this.scanAsync(context);
  }

  private async scanAsync(context: Context): Promise<void> {
    const root = context.projectRoot;
    const workspacePath = path.join(root, "pnpm-workspace.yaml");
    const packageJsonPath = path.join(root, "package.json");
    const lockfilePath = path.join(root, "pnpm-lock.yaml");

    const metadata: PnpmMetadata = {
      exists: false,
      workspaceExists: false,
      workspaceFile: null,
      lockfileExists: false,
      lockfileVersion: null,
      packageManager: null,
      workspacePackages: null,
      catalogs: null,
      onlyBuiltDependencies: null,
      patchedDependencies: null,
      overrides: null,
      peerDependencyRules: null,
      registries: null,
      packageCount: null,
      workspaceGlobs: null,
    };

    metadata.workspaceExists = await this.fileExists(workspacePath);
    metadata.workspaceFile = metadata.workspaceExists ? workspacePath : null;
    metadata.lockfileExists = await this.fileExists(lockfilePath);

    const packageJsonExists = await this.fileExists(packageJsonPath);
    metadata.exists = packageJsonExists || metadata.workspaceExists || metadata.lockfileExists;

    let packageJson: Record<string, unknown> | null = null;
    if (packageJsonExists) {
      try {
        const packageContent = await fs.readFile(packageJsonPath, "utf-8");
        packageJson = JSON.parse(packageContent) as Record<string, unknown>;
        const packageManagerValue = packageJson.packageManager;
        if (typeof packageManagerValue === "string") {
          metadata.packageManager = packageManagerValue.split("@")[0] ?? packageManagerValue;
        }

        const pnpmSection = packageJson.pnpm as Record<string, unknown> | undefined;
        if (pnpmSection) {
          if (pnpmSection.registries && typeof pnpmSection.registries === "object") {
            metadata.registries = pnpmSection.registries as Record<string, unknown>;
          }
          if (pnpmSection.peerDependencyRules && typeof pnpmSection.peerDependencyRules === "object") {
            metadata.peerDependencyRules = pnpmSection.peerDependencyRules as Record<string, unknown>;
          }
          if (pnpmSection.overrides && typeof pnpmSection.overrides === "object") {
            metadata.overrides = pnpmSection.overrides as Record<string, unknown>;
          }
          if (pnpmSection.catalogs && Array.isArray(pnpmSection.catalogs)) {
            metadata.catalogs = pnpmSection.catalogs.map((entry) => String(entry));
          }
        }
      } catch {
        // ignore malformed package.json
      }
    }

    if (metadata.workspaceExists) {
      try {
        const workspaceContent = await fs.readFile(workspacePath, "utf-8");
        metadata.workspaceGlobs = this.extractYamlList(workspaceContent, "packages");
        metadata.workspacePackages = metadata.workspaceGlobs ? [...metadata.workspaceGlobs] : null;
        metadata.catalogs = metadata.catalogs ?? this.extractYamlList(workspaceContent, "catalogs");
      } catch {
        metadata.workspaceGlobs = null;
        metadata.workspacePackages = null;
      }
    }

    if (metadata.lockfileExists) {
      try {
        const lockfileContent = await fs.readFile(lockfilePath, "utf-8");
        metadata.lockfileVersion = this.extractYamlValue(lockfileContent, "lockfileVersion");
        metadata.onlyBuiltDependencies = this.extractYamlBoolean(lockfileContent, "onlyBuiltDependencies");
        metadata.patchedDependencies = this.extractYamlObject(lockfileContent, "patchedDependencies");
        metadata.overrides = metadata.overrides ?? this.extractYamlObject(lockfileContent, "overrides");
        metadata.peerDependencyRules = metadata.peerDependencyRules ?? this.extractYamlObject(lockfileContent, "peerDependencyRules");
        metadata.registries = metadata.registries ?? this.extractYamlObject(lockfileContent, "registries");
        metadata.packageCount = this.countLockfilePackages(lockfileContent);
      } catch {
        // ignore malformed lockfile
      }
    }

    (context.metadata as Record<string, unknown>)["pnpm"] = metadata;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private extractYamlValue(content: string, key: string): string | null {
    const match = content.match(new RegExp(`^${key}\s*:\s*(.+)$`, "m"));
    if (!match) {
      return null;
    }

    return match[1].trim().replace(/['"]+/g, "");
  }

  private extractYamlBoolean(content: string, key: string): boolean | null {
    const value = this.extractYamlValue(content, key);
    if (value === null) {
      return null;
    }

    if (value.toLowerCase() === "true") {
      return true;
    }
    if (value.toLowerCase() === "false") {
      return false;
    }

    return null;
  }

  private extractYamlList(content: string, key: string): string[] | null {
    const regex = new RegExp(`^${key}\s*:\s*\n((?:\s+-\s+.*\n)+)`, "m");
    const match = content.match(regex);
    if (!match) {
      return null;
    }

    const lines = match[1].split(/\r?\n/);
    const values = lines
      .map((line) => line.replace(/^\s*-\s*/, "").trim())
      .filter((value) => value.length > 0);

    return values.length > 0 ? values : null;
  }

  private extractYamlObject(content: string, key: string): Record<string, unknown> | null {
    const regex = new RegExp(`^${key}\s*:\s*\n((?:\s{2,}[^\n]+\n)+)`, "m");
    const match = content.match(regex);
    if (!match) {
      return null;
    }

    const object: Record<string, unknown> = {};
    const lines = match[1].split(/\r?\n/).filter((line) => line.trim().length > 0);

    for (const line of lines) {
      const trimmed = line.trim();
      const keyValue = trimmed.match(/^([^:]+):\s*(.*)$/);
      if (!keyValue) {
        continue;
      }
      const itemKey = keyValue[1].trim();
      const rawValue = keyValue[2].trim();
      if (rawValue === "true") {
        object[itemKey] = true;
      } else if (rawValue === "false") {
        object[itemKey] = false;
      } else if (rawValue === "[]") {
        object[itemKey] = [];
      } else if (rawValue === "{}") {
        object[itemKey] = {};
      } else if (/^\d+$/.test(rawValue)) {
        object[itemKey] = Number(rawValue);
      } else {
        object[itemKey] = rawValue.replace(/['"]+/g, "");
      }
    }

    return Object.keys(object).length > 0 ? object : null;
  }

  private countLockfilePackages(content: string): number | null {
    const regex = /^packages:\s*$/m;
    const startIndex = content.search(regex);
    if (startIndex === -1) {
      return null;
    }

    const contentAfter = content.slice(startIndex);
    const lines = contentAfter.split(/\r?\n/);
    let count = 0;
    for (let i = 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (/^[^\s]/.test(line)) {
        break;
      }
      if (/^\s{2,}['"][^'"]+['"]\s*:/u.test(line) || /^\s{2,}[^\s].*:\s*$/u.test(line)) {
        count += 1;
      }
    }

    return count > 0 ? count : null;
  }
}
