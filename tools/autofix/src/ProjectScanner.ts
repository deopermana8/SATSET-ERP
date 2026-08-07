import { ProjectInfo, ProjectScanCache } from "./types.js";

interface FileSystemModule {
  existsSync(path: string): boolean;
  mkdirSync(path: string, options?: { recursive?: boolean }): void;
  readFileSync(path: string, encoding: string): string;
  writeFileSync(path: string, content: string, encoding: string): void;
}

interface PathModule {
  join(...paths: string[]): string;
  resolve(...paths: string[]): string;
}

interface FastGlobFunction {
  (patterns: readonly string[] | string, options: {
    cwd: string;
    absolute: boolean;
    dot: boolean;
    ignore: string[];
    onlyDirectories?: boolean;
    onlyFiles?: boolean;
    suppressErrors: boolean;
    unique: boolean;
  }): Promise<string[]>;
}

const fs = require("node:fs") as FileSystemModule;
const path = require("node:path") as PathModule;

export interface IProjectScanner {
  scan(forceRefresh?: boolean): Promise<ProjectInfo>;
}

export class ProjectScanner implements IProjectScanner {
  private readonly cacheFilePath: string;
  private readonly ignorePatterns: string[];

  constructor(
    private readonly rootDir: string,
    private readonly toolsDir: string
  ) {
    this.cacheFilePath = path.join(this.toolsDir, ".cache", "project.json");
    this.ignorePatterns = [
      "**/.git/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
      "tools/autofix/.backup/**",
      "tools/autofix/.cache/**",
      "tools/autofix/logs/**"
    ];
  }

  async scan(forceRefresh = false): Promise<ProjectInfo> {
    if (!forceRefresh) {
      const cachedProject = this.readCache();
      if (cachedProject) {
        return cachedProject;
      }
    }

    const fastGlob = require("fast-glob") as FastGlobFunction;
    const [
      tsconfigFiles,
      packageJsonFiles,
      nextConfigFiles,
      schemaPrismaFiles,
      generatedPrismaPaths,
      sourceFiles,
      importableFiles
    ] = await Promise.all([
      fastGlob(["**/tsconfig*.json"], this.createFileOptions()),
      fastGlob(["**/package.json"], this.createFileOptions()),
      fastGlob(["**/next.config.{js,mjs,cjs,ts}"], this.createFileOptions()),
      fastGlob(["**/schema.prisma"], this.createFileOptions()),
      fastGlob(["**/generated/prisma", "**/.prisma/client", "**/generated/client"], this.createDirectoryOptions()),
      fastGlob(["**/*.{ts,tsx,js,mjs,cjs}"], this.createFileOptions()),
      fastGlob(["**/*.{ts,tsx,js,jsx,mjs,cjs,d.ts}"], this.createFileOptions())
    ]);

    const projectInfo: ProjectInfo = {
      rootDir: this.rootDir,
      toolsDir: this.toolsDir,
      buildLogPath: path.join(this.toolsDir, "build.log"),
      cacheFilePath: this.cacheFilePath,
      backupRootDir: path.join(this.toolsDir, ".backup"),
      logDir: path.join(this.toolsDir, "logs"),
      tsconfigFiles,
      packageJsonFiles,
      nextConfigFiles,
      schemaPrismaFiles,
      generatedPrismaPaths,
      sourceFiles,
      importableFiles,
      prismaGeneratorOutputs: {}
    };

    this.writeCache(projectInfo);
    return projectInfo;
  }

  private createFileOptions(): {
    cwd: string;
    absolute: boolean;
    dot: boolean;
    ignore: string[];
    onlyFiles: boolean;
    suppressErrors: boolean;
    unique: boolean;
  } {
    return {
      cwd: this.rootDir,
      absolute: true,
      dot: false,
      ignore: this.ignorePatterns,
      onlyFiles: true,
      suppressErrors: true,
      unique: true
    };
  }

  private createDirectoryOptions(): {
    cwd: string;
    absolute: boolean;
    dot: boolean;
    ignore: string[];
    onlyDirectories: boolean;
    suppressErrors: boolean;
    unique: boolean;
  } {
    return {
      cwd: this.rootDir,
      absolute: true,
      dot: false,
      ignore: this.ignorePatterns,
      onlyDirectories: true,
      suppressErrors: true,
      unique: true
    };
  }

  private readCache(): ProjectInfo | undefined {
    if (!fs.existsSync(this.cacheFilePath)) {
      return undefined;
    }

    try {
      const cache = JSON.parse(fs.readFileSync(this.cacheFilePath, "utf8")) as ProjectScanCache;
      return cache.project;
    }
    catch {
      return undefined;
    }
  }

  private writeCache(project: ProjectInfo): void {
    fs.mkdirSync(path.resolve(this.toolsDir, ".cache"), { recursive: true });
    const cache: ProjectScanCache = {
      createdAt: new Date().toISOString(),
      project
    };

    fs.writeFileSync(this.cacheFilePath, JSON.stringify(cache, null, 2), "utf8");
  }
}
