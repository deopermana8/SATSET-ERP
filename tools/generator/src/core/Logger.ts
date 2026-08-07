import { FileSystem } from "../utils/FileSystem.js";
import { path } from "../utils/Node.js";

export interface ILogger {
  log(level: "debug" | "info" | "warn" | "error", message: string): void;
}

export class Logger implements ILogger {
  private readonly fileSystem = new FileSystem();

  constructor(private readonly generatorRoot: string) {}

  log(level: "debug" | "info" | "warn" | "error", message: string): void {
    if (process.env.SATSET_QA_MODE === "1" && level !== "error") {
      return;
    }

    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    const logFile = path.join(this.generatorRoot, "logs", `${timestamp.slice(0, 10)}.log`);
    this.fileSystem.ensureDirectory(path.dirname(logFile));
    this.fileSystem.writeText(logFile, this.append(logFile, line));
    if (level === "error") {
      console.error(line);
      return;
    }
    console.log(line);
  }

  private append(filePath: string, nextLine: string): string {
    if (!this.fileSystem.exists(filePath)) {
      return `${nextLine}\n`;
    }

    return `${this.fileSystem.readText(filePath)}${nextLine}\n`;
  }
}
