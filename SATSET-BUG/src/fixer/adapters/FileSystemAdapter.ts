import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export interface FileSystemResult<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

export class FileSystemAdapter {
  public async exists(targetPath: string): Promise<FileSystemResult<boolean>> {
    try {
      await fs.access(targetPath);
      return { ok: true, value: true };
    } catch {
      return { ok: true, value: false };
    }
  }

  public async read(targetPath: string): Promise<FileSystemResult<string>> {
    try {
      const content = await fs.readFile(targetPath, "utf8");
      return { ok: true, value: content };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  public async write(targetPath: string, content: string): Promise<FileSystemResult<void>> {
    try {
      await this.mkdir(path.dirname(targetPath));
      await fs.writeFile(targetPath, content, "utf8");
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  public async copy(sourcePath: string, destinationPath: string): Promise<FileSystemResult<void>> {
    try {
      await this.mkdir(path.dirname(destinationPath));
      await fs.copyFile(sourcePath, destinationPath);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  public async backup(targetPath: string): Promise<FileSystemResult<string>> {
    const backupPath = path.join(path.dirname(targetPath), `${path.basename(targetPath)}.bak`);
    const copyResult = await this.copy(targetPath, backupPath);
    if (!copyResult.ok) {
      return { ok: false, error: copyResult.error };
    }

    return { ok: true, value: backupPath };
  }

  public async restore(backupId: string): Promise<FileSystemResult<void>> {
    try {
      const backupPath = backupId;
      const targetPath = backupPath.replace(/\.bak$/, "");
      await this.copy(backupPath, targetPath);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  public async remove(targetPath: string): Promise<FileSystemResult<void>> {
    try {
      await fs.rm(targetPath, { force: true, recursive: true });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  public async mkdir(targetPath: string): Promise<FileSystemResult<void>> {
    try {
      await fs.mkdir(targetPath, { recursive: true });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  public async hash(targetPath: string): Promise<FileSystemResult<string>> {
    const readResult = await this.read(targetPath);
    if (!readResult.ok || readResult.value === undefined) {
      return { ok: false, error: readResult.error ?? "Unable to read file for hashing." };
    }

    const hash = crypto.createHash("sha256").update(readResult.value, "utf8").digest("hex");
    return { ok: true, value: hash };
  }
}
