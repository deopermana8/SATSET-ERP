import { LogEntry } from "./types.js";

interface FileSystemModule {
  appendFileSync(path: string, content: string, encoding: string): void;
  existsSync(path: string): boolean;
  mkdirSync(path: string, options?: { recursive?: boolean }): void;
  writeFileSync(path: string, content: string, encoding: string): void;
}

interface PathModule {
  join(...paths: string[]): string;
}

const fs = require("node:fs") as FileSystemModule;
const path = require("node:path") as PathModule;

export interface ILogger {
  log(entry: LogEntry): void;
}

export class Logger implements ILogger {
  constructor(private readonly logDirectory: string) {}

  log(entry: LogEntry): void {
    fs.mkdirSync(this.logDirectory, { recursive: true });
    const logFilePath = path.join(this.logDirectory, `${this.formatDateOnly(new Date())}.log`);

    if (!fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, "timestamp\trule\tfile\tstatus\tduration\n", "utf8");
    }

    const line = [
      entry.timestamp,
      entry.rule,
      entry.file,
      entry.status,
      entry.durationMs.toString()
    ].join("\t");

    fs.appendFileSync(logFilePath, `${line}\n`, "utf8");
  }

  private formatDateOnly(value: Date): string {
    const year = value.getFullYear().toString().padStart(4, "0");
    const month = (value.getMonth() + 1).toString().padStart(2, "0");
    const day = value.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
