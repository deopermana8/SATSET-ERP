import fs from "node:fs";
import path from "node:path";

export interface WriteEntry {
  filePath: string;
  content: string;
}

export interface WriteSummary {
  written: string[];
  skipped: string[];
  errors: string[];
  dryRun: boolean;
}

export interface ProjectWriterOptions {
  dryRun?: boolean;
  overwrite?: boolean;
}

export class ProjectWriter {
  private readonly opts: Required<ProjectWriterOptions>;
  private readonly written: string[] = [];
  private readonly skipped: string[] = [];
  private readonly errors: string[] = [];

  constructor(opts: ProjectWriterOptions = {}) {
    this.opts = { dryRun: false, overwrite: true, ...opts };
  }

  createDirectory(dirPath: string): void {
    if (this.opts.dryRun) return;
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (err) {
      this.errors.push(`createDirectory ${dirPath}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  writeFile(filePath: string, content: string): boolean {
    if (!this.opts.overwrite && fs.existsSync(filePath)) {
      this.skipped.push(filePath);
      return false;
    }
    if (this.opts.dryRun) {
      this.written.push(filePath);
      return true;
    }
    try {
      this.createDirectory(path.dirname(filePath));
      fs.writeFileSync(filePath, content, "utf8");
      this.written.push(filePath);
      return true;
    } catch (err) {
      this.errors.push(`writeFile ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }

  overwrite(filePath: string, content: string): boolean {
    const prev = this.opts.overwrite;
    (this.opts as { overwrite: boolean }).overwrite = true;
    const result = this.writeFile(filePath, content);
    (this.opts as { overwrite: boolean }).overwrite = prev;
    return result;
  }

  skipExisting(filePath: string, content: string): boolean {
    if (fs.existsSync(filePath)) {
      this.skipped.push(filePath);
      return false;
    }
    return this.writeFile(filePath, content);
  }

  dryRun(entries: WriteEntry[]): WriteSummary {
    const dryWriter = new ProjectWriter({ dryRun: true, overwrite: this.opts.overwrite });
    for (const { filePath, content } of entries) {
      dryWriter.writeFile(filePath, content);
    }
    return dryWriter.summary();
  }

  writeMany(entries: WriteEntry[]): WriteSummary {
    for (const { filePath, content } of entries) {
      this.writeFile(filePath, content);
    }
    return this.summary();
  }

  summary(): WriteSummary {
    return {
      written: [...this.written],
      skipped: [...this.skipped],
      errors: [...this.errors],
      dryRun: this.opts.dryRun,
    };
  }
}
