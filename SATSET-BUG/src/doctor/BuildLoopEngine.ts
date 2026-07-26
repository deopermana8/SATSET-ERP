import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";
import { CommandExecutor } from "../commands/CommandExecutor.js";
import { CheckpointManager } from "./CheckpointManager.js";

export interface BuildState {
  status: "running" | "completed" | "failed" | "recovered";
  stage: "bootstrap" | "compile" | "test" | "verify" | "repair" | "complete";
  attempt: number;
  startedAt: string;
  completedAt?: string;
  reason?: string;
}

export interface CompilerResult {
  succeeded: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  diagnostics: string[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

export interface BuildReport {
  compilerResult: CompilerResult;
  testResults: TestResult[];
  summary: {
    status: "passed" | "failed";
    message: string;
    durationMs: number;
  };
}

export interface BuildLoopArtifacts {
  state: BuildState;
  report: BuildReport;
}

export class BuildLoopEngine implements IEngine {
  public readonly name = "BuildLoopEngine";

  constructor(
    private readonly executor = new CommandExecutor(),
    private readonly checkpointManager = new CheckpointManager(process.cwd())
  ) {}

  async run(context: Context): Promise<void> {
    const startedAt = Date.now();
    const pipeline = new ArtifactPipeline(context.projectRoot);
    const state: BuildState = {
      status: "running",
      stage: "bootstrap",
      attempt: 1,
      startedAt: new Date().toISOString(),
    };

    await pipeline.run(context, [{
      id: "build-loop-progress",
      name: "build-loop-progress",
      templatePath: path.join(context.projectRoot, "templates", "build-progress.json.tpl"),
      outputPath: path.join(context.projectRoot, ".progress.json"),
      variables: {
        currentStage: "build",
        progress: "70",
        currentTask: "running build loop",
        estimatedRemaining: "15s",
      },
    }]);

    const compilerResult = await this.runCompiler(context);
    const testResults = await this.runTests(context);
    const summary = this.summarize(compilerResult, testResults, startedAt);

    state.status = summary.status === "passed" ? "completed" : "failed";
    state.stage = summary.status === "passed" ? "complete" : "verify";
    state.completedAt = new Date().toISOString();
    state.reason = summary.message;

    const checkpoint = await this.restoreCheckpoint(context);
    if (checkpoint && summary.status === "failed") {
      state.status = "recovered";
      state.stage = "repair";
      state.reason = `Recovered from checkpoint ${checkpoint.stage ?? "unknown"}`;
    }

    const artifact: BuildLoopArtifacts = { state, report: { compilerResult, testResults, summary } };
    context.metadata = {
      ...context.metadata,
      buildLoop: artifact,
    } as typeof context.metadata & { buildLoop?: BuildLoopArtifacts };

    await this.checkpointManager.save(context, [], state.stage);
  }

  private async runCompiler(context: Context): Promise<CompilerResult> {
    const result = await this.executor.pnpm(["exec", "tsc", "-p", "tsconfig.json", "--noEmit"], context.projectRoot);
    const diagnostics = [...result.stderr.split(/\n+/), ...result.stdout.split(/\n+/)]
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12);

    return {
      succeeded: result.exitCode === 0,
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      diagnostics,
    };
  }

  private async runTests(context: Context): Promise<TestResult[]> {
    const candidates = [
      ["exec", "tsx", "tests/build-loop.test.ts"],
      ["exec", "tsx", "tests/reasoning-brain.test.ts"],
    ];

    const results: TestResult[] = [];
    for (const args of candidates) {
      const result = await this.executor.pnpm(args, context.projectRoot);
      results.push({
        name: args.slice(2).join(" "),
        passed: result.exitCode === 0,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }
    return results;
  }

  private summarize(compilerResult: CompilerResult, testResults: TestResult[], startedAt: number): BuildReport["summary"] {
    const allPassed = compilerResult.succeeded && testResults.every((test) => test.passed);
    return {
      status: allPassed ? "passed" : "failed",
      message: allPassed ? "Build loop completed successfully" : "Build loop detected compiler or test failures",
      durationMs: Date.now() - startedAt,
    };
  }

  private async restoreCheckpoint(context: Context): Promise<{ stage?: string } | undefined> {
    const checkpointPath = path.join(context.projectRoot, ".satset-checkpoint.json");
    try {
      const content = await fs.readFile(checkpointPath, "utf8");
      const snapshot = JSON.parse(content) as { stage?: string };
      return snapshot;
    } catch {
      return undefined;
    }
  }
}
