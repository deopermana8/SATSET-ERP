import fs from "node:fs/promises";
import path from "node:path";
import { WorkspaceResolver } from "./WorkspaceResolver.js";

export interface BinaryResolution {
  found: boolean;
  strategy: string;
  command: string;
  workingDirectory: string;
}

export class BinaryResolver {
  constructor(private readonly workspaceResolver: WorkspaceResolver = new WorkspaceResolver()) {}

  async resolve(binaryName: string, startPath: string): Promise<BinaryResolution> {
    try {
      const baseDirectory = await this.resolveDirectory(startPath);
      const projectRoot = await this.workspaceResolver.findProjectRoot(baseDirectory);
      const workspaceRoot = await this.workspaceResolver.findWorkspaceRoot(baseDirectory);

      const localBin = await this.findLocalBin(projectRoot, binaryName);
      if (localBin) {
        return {
          found: true,
          strategy: "node_modules/.bin",
          command: this.quote(localBin),
          workingDirectory: projectRoot,
        };
      }

      if (workspaceRoot !== projectRoot) {
        const workspaceBin = await this.findLocalBin(workspaceRoot, binaryName);
        if (workspaceBin) {
          return {
            found: true,
            strategy: "workspace node_modules/.bin",
            command: this.quote(workspaceBin),
            workingDirectory: projectRoot,
          };
        }
      }

      if (await this.findOnPath("pnpm")) {
        return {
          found: true,
          strategy: "pnpm exec",
          command: `pnpm exec ${binaryName}`,
          workingDirectory: projectRoot,
        };
      }

      if (await this.findOnPath("npm")) {
        return {
          found: true,
          strategy: "npm exec",
          command: `npm exec -- ${binaryName}`,
          workingDirectory: projectRoot,
        };
      }

      if (await this.findOnPath("npx")) {
        return {
          found: true,
          strategy: "npx",
          command: `npx ${binaryName}`,
          workingDirectory: projectRoot,
        };
      }

      if (await this.findOnPath("yarn")) {
        return {
          found: true,
          strategy: "yarn",
          command: `yarn ${binaryName}`,
          workingDirectory: projectRoot,
        };
      }

      if (await this.findOnPath("bunx")) {
        return {
          found: true,
          strategy: "bunx",
          command: `bunx ${binaryName}`,
          workingDirectory: projectRoot,
        };
      }

      const pathBinary = await this.findOnPath(binaryName);
      if (pathBinary) {
        return {
          found: true,
          strategy: "PATH",
          command: this.quote(pathBinary),
          workingDirectory: projectRoot,
        };
      }

      return {
        found: false,
        strategy: "not-found",
        command: binaryName,
        workingDirectory: projectRoot,
      };
    } catch (error) {
      return {
        found: false,
        strategy: `error:${this.toErrorMessage(error)}`,
        command: binaryName,
        workingDirectory: path.resolve(startPath),
      };
    }
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

  private async findLocalBin(root: string, binaryName: string): Promise<string | undefined> {
    const binDirectory = path.join(root, "node_modules", ".bin");
    return this.findExecutableInDirectory(binDirectory, binaryName);
  }

  private async findOnPath(binaryName: string): Promise<string | undefined> {
    const rawPath = process.env.PATH ?? "";
    const pathEntries = rawPath.split(path.delimiter).filter((entry) => entry.trim().length > 0);

    for (const entry of pathEntries) {
      const candidate = await this.findExecutableInDirectory(entry, binaryName);
      if (candidate) {
        return candidate;
      }
    }

    return undefined;
  }

  private async findExecutableInDirectory(directory: string, binaryName: string): Promise<string | undefined> {
    const names = this.candidateNames(binaryName);
    for (const name of names) {
      const fullPath = path.join(directory, name);
      if (await this.isExecutableFile(fullPath)) {
        return fullPath;
      }
    }

    return undefined;
  }

  private candidateNames(binaryName: string): string[] {
    const extension = path.extname(binaryName);
    if (extension.length > 0) {
      return [binaryName];
    }

    const names = new Set<string>([binaryName]);
    const platformExtensions = this.platformExtensions();
    for (const ext of platformExtensions) {
      names.add(`${binaryName}${ext}`);
    }

    return Array.from(names);
  }

  private platformExtensions(): string[] {
    const defaultWindows = [".cmd", ".exe", ".bat", ".ps1"];
    const pathExt = process.env.PATHEXT;

    if (process.platform === "win32") {
      if (!pathExt) {
        return defaultWindows;
      }

      const parsed = pathExt
        .split(";")
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 0)
        .map((value) => (value.startsWith(".") ? value : `.${value}`));

      return parsed.length > 0 ? parsed : defaultWindows;
    }

    return [".sh"];
  }

  private async isExecutableFile(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  private quote(value: string): string {
    if (value.includes(" ")) {
      return `"${value}"`;
    }
    return value;
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
