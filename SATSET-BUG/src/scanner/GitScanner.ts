import { promises as fs } from "fs";
import path from "path";
import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

interface GitMetadata {
  exists: boolean;
  branch: string | null;
  remoteOrigin: string | null;
  hasGitignore: boolean;
  hasGitAttributes: boolean;
  ignoredNodeModules: boolean;
  ignoredEnv: boolean;
  ignoredBuild: boolean;
  ignoredGenerated: boolean;
  hooksDetected: boolean;
}

export class GitScanner implements IScanner {
  public readonly name = "GitScanner";

  public scan(context: Context): void {
    void this.scanAsync(context);
  }

  private async scanAsync(context: Context): Promise<void> {
    const root = context.projectRoot;
    const gitignorePath = path.join(root, ".gitignore");
    const gitattributesPath = path.join(root, ".gitattributes");
    const gitConfigPath = path.join(root, ".git", "config");
    const gitHeadPath = path.join(root, ".git", "HEAD");
    const hooksPath = path.join(root, ".git", "hooks");

    const metadata: GitMetadata = {
      exists: false,
      branch: null,
      remoteOrigin: null,
      hasGitignore: false,
      hasGitAttributes: false,
      ignoredNodeModules: false,
      ignoredEnv: false,
      ignoredBuild: false,
      ignoredGenerated: false,
      hooksDetected: false,
    };

    metadata.hasGitignore = await this.fileExists(gitignorePath);
    metadata.hasGitAttributes = await this.fileExists(gitattributesPath);
    const configExists = await this.fileExists(gitConfigPath);
    metadata.exists = configExists;

    if (configExists) {
      try {
        const content = await fs.readFile(gitConfigPath, "utf-8");
        metadata.remoteOrigin = this.extractGitRemoteOrigin(content);
      } catch {
        metadata.remoteOrigin = null;
      }
    }

    if (await this.fileExists(gitHeadPath)) {
      try {
        const head = await fs.readFile(gitHeadPath, "utf-8");
        metadata.branch = this.parseGitHead(head);
      } catch {
        metadata.branch = null;
      }
    }

    if (metadata.hasGitignore) {
      try {
        const ignoreContent = await fs.readFile(gitignorePath, "utf-8");
        metadata.ignoredNodeModules = this.matchesIgnore(ignoreContent, ["node_modules", "/node_modules"]);
        metadata.ignoredEnv = this.matchesIgnore(ignoreContent, [".env", ".env.local", ".env.*"]);
        metadata.ignoredBuild = this.matchesIgnore(ignoreContent, ["dist", "build", ".next", "out"]);
        metadata.ignoredGenerated = this.matchesIgnore(ignoreContent, ["*.generated.*", "generated", "build/**"]);
      } catch {
        metadata.ignoredNodeModules = false;
        metadata.ignoredEnv = false;
        metadata.ignoredBuild = false;
        metadata.ignoredGenerated = false;
      }
    }

    metadata.hooksDetected = await this.directoryExists(hooksPath);

    (context.metadata as Record<string, unknown>)["git"] = metadata;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  private parseGitHead(content: string): string | null {
    const match = content.match(/^ref:\s*refs\/heads\/(.+)$/m);
    return match ? match[1].trim() : null;
  }

  private extractGitRemoteOrigin(content: string): string | null {
    const sectionRegex = /\[remote \"origin\"\]([\s\S]*?)(?=\n\[|$)/g;
    const match = sectionRegex.exec(content);
    if (!match) {
      return null;
    }

    const urlMatch = match[1].match(/\n\s*url\s*=\s*(.+)/);
    return urlMatch ? urlMatch[1].trim() : null;
  }

  private matchesIgnore(content: string, patterns: string[]): boolean {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    for (const pattern of patterns) {
      for (const line of lines) {
        if (line === pattern || line === `/${pattern}` || line.startsWith(pattern) || line.includes(pattern)) {
          return true;
        }
      }
    }

    return false;
  }
}
