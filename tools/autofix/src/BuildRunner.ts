import { BuildPipelineResult, BuildResult, BuildStep, Diagnostic } from "./types.js";
import { ErrorParser } from "./ErrorParser.js";

interface FileSystemModule {
  mkdirSync(path: string, options?: { recursive?: boolean }): void;
  writeFileSync(path: string, content: string, encoding: string): void;
}

interface PathModule {
  dirname(filePath: string): string;
}

interface ExecaResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  all?: string;
  failed: boolean;
}

interface ExecaFunction {
  (command: string, arguments_: string[], options: {
    cwd: string;
    all: boolean;
    reject: boolean;
  }): Promise<ExecaResult>;
}

const fs = require("node:fs") as FileSystemModule;
const path = require("node:path") as PathModule;

export interface IBuildRunner {
  run(rootDir: string, logPath: string): Promise<BuildResult>;
  runPipeline(rootDir: string, logPath: string): Promise<BuildPipelineResult>;
}

export class BuildRunner implements IBuildRunner {
  private readonly parser = new ErrorParser();

  constructor(
    private readonly command = "pnpm",
    private readonly arguments_ = ["build"]
  ) {}

  async run(rootDir: string, logPath: string): Promise<BuildResult> {
    return this.runStep(rootDir, logPath, "pnpm", this.command, this.arguments_);
  }

  async runPipeline(rootDir: string, logPath: string): Promise<BuildPipelineResult> {
    const pipeline: Array<{ arguments_: string[]; command: string; step: BuildStep }> = [
      { arguments_: ["build"], command: "pnpm", step: "pnpm" },
      { arguments_: ["-p", "tools/autofix/tsconfig.json", "--noEmit"], command: "tsc", step: "tsc" },
      { arguments_: ["."], command: "eslint", step: "eslint" },
      { arguments_: ["build"], command: "next", step: "next-build" },
      { arguments_: ["validate", "--schema", "prisma/schema.prisma"], command: "prisma", step: "prisma-validate" }
    ];
    const logs: BuildResult[] = [];
    const diagnostics: Diagnostic[] = [];
    let success = true;

    for (const item of pipeline) {
      const result = await this.runStep(rootDir, logPath.replace(/\.log$/i, `-${item.step}.log`), item.step, item.command, item.arguments_);
      logs.push(result);
      diagnostics.push(...this.parser.parseDiagnostics(result.combinedOutput, item.step));
      if (!result.success) {
        success = false;
      }
    }

    return {
      diagnostics,
      logs,
      success
    };
  }

  private async runStep(rootDir: string, logPath: string, step: BuildStep, command: string, arguments_: string[]): Promise<BuildResult> {
    if (process.env.SATSET_QA_MODE === "1") {
      const combinedOutput = `[qa-mode] ${command} ${arguments_.join(" ")}`;
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.writeFileSync(logPath, combinedOutput, "utf8");
      return {
        command: [command, ...arguments_].join(" "),
        success: true,
        exitCode: 0,
        stdout: combinedOutput,
        stderr: "",
        combinedOutput,
        logPath,
        durationMs: 0,
        step
      };
    }

    const { execa } = require("execa") as { execa: ExecaFunction };
    const startedAt = Date.now();
    let result: ExecaResult;
    try {
      result = await execa(command, arguments_, {
        cwd: rootDir,
        all: true,
        reject: false
      });
    }
    catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      result = {
        all: message,
        exitCode: 1,
        failed: true,
        stderr: message,
        stdout: ""
      };
    }
    const durationMs = Date.now() - startedAt;
    const combinedOutput = result.all ?? [result.stdout, result.stderr].filter((value) => value.length > 0).join("\n");

    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.writeFileSync(logPath, combinedOutput, "utf8");

    return {
      command: [command, ...arguments_].join(" "),
      success: result.exitCode === 0,
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      combinedOutput,
      logPath,
      durationMs,
      step
    };
  }
}
