import fs from "node:fs/promises";
import path from "node:path";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";
export type WorkspaceType = "single" | "pnpm" | "turbo" | "nx";

const WORKSPACE_MARKERS = [
  "pnpm-workspace.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lockb",
  "turbo.json",
  "nx.json",
] as const;

export class WorkspaceResolver {
  async findWorkspaceRoot(startPath: string): Promise<string> {
    let current = await this.resolveDirectory(startPath);
    let nearestProjectRoot: string | undefined;

    while (true) {
      if (!nearestProjectRoot && (await this.exists(path.join(current, "package.json")))) {
        nearestProjectRoot = current;
      }

      if (await this.hasAnyMarker(current, WORKSPACE_MARKERS)) {
        return current;
      }

      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }

    return nearestProjectRoot ?? (await this.resolveDirectory(startPath));
  }

  async findProjectRoot(startPath: string): Promise<string> {
    let current = await this.resolveDirectory(startPath);

    while (true) {
      if (await this.exists(path.join(current, "package.json"))) {
        return current;
      }

      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }

    return this.findWorkspaceRoot(startPath);
  }

  async detectPackageManager(root: string): Promise<PackageManager> {
    if (await this.exists(path.join(root, "pnpm-lock.yaml"))) {
      return "pnpm";
    }
    if (await this.exists(path.join(root, "package-lock.json"))) {
      return "npm";
    }
    if (await this.exists(path.join(root, "yarn.lock"))) {
      return "yarn";
    }
    if (await this.exists(path.join(root, "bun.lockb"))) {
      return "bun";
    }

    return "npm";
  }

  async detectWorkspaceType(root: string): Promise<WorkspaceType> {
    if (await this.exists(path.join(root, "nx.json"))) {
      return "nx";
    }
    if (await this.exists(path.join(root, "turbo.json"))) {
      return "turbo";
    }
    if (await this.exists(path.join(root, "pnpm-workspace.yaml"))) {
      return "pnpm";
    }

    return "single";
  }

  private async resolveDirectory(startPath: string): Promise<string> {
    const resolvedPath = path.resolve(startPath);

    try {
      const stats = await fs.stat(resolvedPath);
      return stats.isDirectory() ? resolvedPath : path.dirname(resolvedPath);
    } catch {
      return path.dirname(resolvedPath);
    }
  }

  private async hasAnyMarker(root: string, markers: readonly string[]): Promise<boolean> {
    for (const marker of markers) {
      if (await this.exists(path.join(root, marker))) {
        return true;
      }
    }

    return false;
  }

  private async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
