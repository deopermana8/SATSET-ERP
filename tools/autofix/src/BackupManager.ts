import { BackupResult } from "./types.js";

interface FileSystemModule {
  copyFileSync(source: string, destination: string): void;
  existsSync(path: string): boolean;
  mkdirSync(path: string, options?: { recursive?: boolean }): void;
}

interface PathModule {
  dirname(filePath: string): string;
  join(...paths: string[]): string;
  relative(from: string, to: string): string;
}

const fs = require("node:fs") as FileSystemModule;
const path = require("node:path") as PathModule;

export interface IBackupManager {
  backupFiles(filePaths: readonly string[]): BackupResult;
}

export class BackupManager implements IBackupManager {
  private readonly sessionDirectory: string;

  constructor(
    private readonly rootDir: string,
    private readonly backupRootDir: string
  ) {
    this.sessionDirectory = path.join(this.backupRootDir, this.formatTimestamp(new Date()));
  }

  backupFiles(filePaths: readonly string[]): BackupResult {
    const copiedFiles: string[] = [];
    fs.mkdirSync(this.sessionDirectory, { recursive: true });

    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) {
        continue;
      }

      const relativePath = path.relative(this.rootDir, filePath);
      const backupPath = path.join(this.sessionDirectory, relativePath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(filePath, backupPath);
      copiedFiles.push(backupPath);
    }

    return {
      backupDirectory: this.sessionDirectory,
      files: copiedFiles
    };
  }

  private formatTimestamp(value: Date): string {
    const year = value.getFullYear().toString().padStart(4, "0");
    const month = (value.getMonth() + 1).toString().padStart(2, "0");
    const day = value.getDate().toString().padStart(2, "0");
    const hours = value.getHours().toString().padStart(2, "0");
    const minutes = value.getMinutes().toString().padStart(2, "0");
    const seconds = value.getSeconds().toString().padStart(2, "0");
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
  }
}
