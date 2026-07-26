import crypto from "crypto";
import fs from "node:fs";
import path from "node:path";
import type { Context } from "./Context.js";

export interface ProjectFingerprint {
  framework: string | null;
  packageManager: string | null;
  workspace: boolean;
  typescript: string | null;
  react: string | null;
  next: string | null;
  prisma: string | null;
  tailwind: string | null;
  turbo: string | null;
  database: string | null;
  nodeVersion: string | null;
  dependencyCount: number;
  workspaceCount: number;
  trackedFileCount: number;
  trackedFilesHash: string;
  hash: string;
  signature: string;
}

export class ProjectFingerprintCalculator {
  public generate(context: Context): ProjectFingerprint {
    const metadata = context.metadata as Record<string, unknown>;

    const framework = this.getFramework(metadata);
    const packageManager = this.getPackageManager(metadata);
    const workspacePackages = this.getWorkspacePackages(metadata);
    const typescript = this.getVersion(metadata.typescript as Record<string, unknown> | null, "version");
    const react = this.getVersion(metadata.react as Record<string, unknown> | null, "reactVersion");
    const next = this.getVersion(metadata.next as Record<string, unknown> | null, "nextVersion");
    const prisma = this.getVersion(metadata.prisma as Record<string, unknown> | null, "prismaVersion");
    const tailwind = this.getVersion(metadata.tailwind as Record<string, unknown> | null, "version");
    const turbo = this.getVersion(metadata.turbo as Record<string, unknown> | null, "packageManager");
    const database = this.getDatabase(metadata);
    const nodeVersion = typeof context.nodeVersion === "string" ? context.nodeVersion : null;
    const dependencyCount = this.getDependencyCount(metadata);
    const workspaceCount = workspacePackages.length;
    const trackedFiles = this.collectMeaningfulFiles(context.projectRoot);
    const trackedFileCount = trackedFiles.length;
    const trackedFilesHash = this.createStableHash(trackedFiles);

    const fingerprintPayload = {
      framework,
      packageManager,
      workspace: workspaceCount > 0,
      typescript,
      react,
      next,
      prisma,
      tailwind,
      turbo,
      database,
      nodeVersion,
      dependencyCount,
      workspaceCount,
      trackedFileCount,
      trackedFilesHash,
    };

    const hash = this.createStableHash(fingerprintPayload);
    const signature = `${framework ?? "unknown"}:${packageManager ?? "unknown"}:${hash}`;

    return {
      ...fingerprintPayload,
      hash,
      signature,
    };
  }

  private getFramework(metadata: Record<string, unknown>): string | null {
    if (this.hasMetadata(metadata.next)) {
      return "next";
    }
    if (this.hasMetadata(metadata.react)) {
      return "react";
    }
    if (this.hasMetadata(metadata.tailwind)) {
      return "tailwind";
    }
    if (this.hasMetadata(metadata.turbo)) {
      return "turbo";
    }
    return null;
  }

  private getPackageManager(metadata: Record<string, unknown>): string | null {
    if (typeof metadata.packageManager === "string") {
      return metadata.packageManager;
    }
    const pnpm = metadata.pnpm as Record<string, unknown> | null;
    if (pnpm && typeof pnpm.packageManager === "string") {
      return pnpm.packageManager;
    }
    return null;
  }

  private getWorkspacePackages(metadata: Record<string, unknown>): string[] {
    const pnpm = metadata.pnpm as Record<string, unknown> | null;
    if (pnpm && Array.isArray(pnpm.workspacePackages)) {
      return pnpm.workspacePackages.map(String);
    }

    const packageJson = metadata.packageJson as Record<string, unknown> | null;
    if (!packageJson) {
      return [];
    }

    const workspaces = packageJson.workspaces;
    if (Array.isArray(workspaces)) {
      return workspaces.map(String);
    }
    if (workspaces && typeof workspaces === "object" && Array.isArray((workspaces as Record<string, unknown>).packages)) {
      return ((workspaces as Record<string, unknown>).packages as unknown[]).map(String);
    }

    return [];
  }

  private getVersion(metadata: Record<string, unknown> | null, key: string): string | null {
    if (!metadata || typeof metadata !== "object") {
      return null;
    }
    const value = metadata[key as keyof typeof metadata];
    return typeof value === "string" ? value : null;
  }

  private getDatabase(metadata: Record<string, unknown>): string | null {
    const prisma = metadata.prisma as Record<string, unknown> | null;
    if (prisma && this.getVersion(prisma, "prismaVersion")) {
      return "prisma";
    }

    const environment = metadata.environment as Record<string, unknown> | null;
    if (environment && environment.hasOwnProperty("hasDatabaseUrl") && environment.hasOwnProperty("hasSupabaseUrl")) {
      if (environment.hasOwnProperty("hasSupabaseUrl") && (environment.hasOwnProperty("hasSupabaseUrl") as unknown)) {
        return "supabase";
      }
      if (environment.hasOwnProperty("hasDatabaseUrl")) {
        return "database";
      }
    }

    return null;
  }

  private getDependencyCount(metadata: Record<string, unknown>): number {
    const dependencies = metadata.dependencies as Record<string, unknown> | null;
    if (dependencies && typeof dependencies.totalPackages === "number") {
      return dependencies.totalPackages;
    }
    return 0;
  }

  private collectMeaningfulFiles(projectRoot: string): Array<{ relativePath: string; hash: string }> {
    const trackedFiles: Array<{ relativePath: string; hash: string }> = [];
    const queue = [projectRoot];
    const ignoredDirectories = new Set([".git", ".history", ".next", ".turbo", ".cache", "node_modules", "dist", "build", "coverage", "out"]);
    const ignoredFiles = new Set([".DS_Store", "Thumbs.db", "package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml"]);
    const includedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".yaml", ".yml", ".toml", ".prisma", ".env"]);
    const includedFiles = new Set(["package.json", "pnpm-workspace.yaml", "turbo.json", "tsconfig.json", "postcss.config.js", "postcss.config.cjs", "postcss.config.mjs", "postcss.config.ts", "tailwind.config.js", "tailwind.config.cjs", "tailwind.config.mjs", "tailwind.config.ts", "next.config.js", "next.config.cjs", "next.config.mjs", "next.config.ts"]);

    while (queue.length > 0) {
      const currentPath = queue.shift();
      if (!currentPath) continue;

      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(currentPath, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const entry of entries) {
        const absolutePath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          if (!ignoredDirectories.has(entry.name)) {
            queue.push(absolutePath);
          }
          continue;
        }

        if (entry.isFile()) {
          const relativePath = path.relative(projectRoot, absolutePath).split(path.sep).join("/");
          if (!relativePath || ignoredFiles.has(entry.name)) {
            continue;
          }

          const extension = path.extname(entry.name);
          const isIncludedByExtension = includedExtensions.has(extension);
          const isIncludedByName = includedFiles.has(entry.name) || entry.name.startsWith(".env") || entry.name.endsWith(".prisma");
          if (!isIncludedByExtension && !isIncludedByName) {
            continue;
          }

          const fileContent = fs.readFileSync(absolutePath, "utf8");
          trackedFiles.push({
            relativePath,
            hash: this.createStableHash({ path: relativePath, content: fileContent }),
          });
        }
      }
    }

    return trackedFiles.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  }

  private createStableHash(value: unknown): string {
    const stableString = this.stringifyStable(value);
    return crypto.createHash("sha256").update(stableString, "utf8").digest("hex");
  }

  private stringifyStable(value: unknown): string {
    if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stringifyStable(item)).join(",")} ]`;
    }

    const sortedKeys = Object.keys(value).sort();
    const entries = sortedKeys.map((key) => `${JSON.stringify(key)}:${this.stringifyStable((value as Record<string, unknown>)[key])}`);
    return `{${entries.join(",")}}`;
  }

  private hasMetadata(value: unknown): boolean {
    if (!value || typeof value !== "object") {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return Object.keys(value).length > 0;
  }
}
