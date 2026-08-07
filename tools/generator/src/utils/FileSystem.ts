import { FastGlobOptions, fs, getFastGlob, path } from "./Node.js";

export interface IFileSystem {
  ensureDirectory(directoryPath: string): void;
  ensureDirectoryForFile(filePath: string): void;
  exists(filePath: string): boolean;
  hash(content: string): string;
  readText(filePath: string): string;
  scan(patterns: readonly string[] | string, options: FastGlobOptions): Promise<string[]>;
  writeText(filePath: string, content: string): void;
}

export class FileSystem implements IFileSystem {
  ensureDirectory(directoryPath: string): void {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  ensureDirectoryForFile(filePath: string): void {
    this.ensureDirectory(path.dirname(filePath));
  }

  exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  hash(content: string): string {
    let hash = 5381;
    for (let index = 0; index < content.length; index += 1) {
      hash = ((hash << 5) + hash) ^ content.charCodeAt(index);
    }
    return Math.abs(hash >>> 0).toString(16).padStart(8, "0");
  }

  readText(filePath: string): string {
    return fs.readFileSync(filePath, "utf8");
  }

  async scan(patterns: readonly string[] | string, options: FastGlobOptions): Promise<string[]> {
    const fastGlob = getFastGlob();
    return fastGlob(patterns, options);
  }

  writeText(filePath: string, content: string): void {
    this.ensureDirectoryForFile(filePath);
    fs.writeFileSync(filePath, content, "utf8");
  }
}
