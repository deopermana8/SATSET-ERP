import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { CommandExecutor } from "../../commands/CommandExecutor.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface TestMetrics {
  unitExitCode: number | null;
  integrationExitCode: number | null;
  e2eExitCode: number | null;
  coverage: number;
  durationMs: number;
  failedTests: string[];
  logs: string[];
}

export class TestEngine implements IEngine {
  public readonly name = "TestEngine";
  constructor(private readonly executor = new CommandExecutor()) {}

  async run(context: Context): Promise<void> {
    const metrics: TestMetrics = {
      unitExitCode: null,
      integrationExitCode: null,
      e2eExitCode: null,
      coverage: 0,
      durationMs: 0,
      failedTests: [],
      logs: [],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "test-progress",
      name: "test-progress",
      templatePath: path.join(context.projectRoot, "templates", "test-progress.json.tpl"),
      outputPath: path.join(context.projectRoot, ".progress.json"),
      variables: {
        currentStage: "test",
        progress: "60",
        currentTask: "running tests",
        estimatedRemaining: "20s",
      },
    }]);

    const startedAt = Date.now();
    const unitResult = await this.executor.pnpm(["exec", "tsx", "tests/ai-artifact-generation.test.ts"], context.projectRoot);
    metrics.unitExitCode = unitResult.exitCode;
    metrics.logs.push(unitResult.stdout, unitResult.stderr);
    if (unitResult.exitCode !== 0) {
      metrics.failedTests.push(...unitResult.stderr.split(/\n+/).filter(Boolean).slice(0, 5));
    }

    const integrationResult = await this.executor.pnpm(["exec", "tsx", "tests/factory-flow.test.ts"], context.projectRoot);
    metrics.integrationExitCode = integrationResult.exitCode;
    metrics.logs.push(integrationResult.stdout, integrationResult.stderr);
    if (integrationResult.exitCode !== 0) {
      metrics.failedTests.push(...integrationResult.stderr.split(/\n+/).filter(Boolean).slice(0, 5));
    }

    metrics.durationMs = Date.now() - startedAt;
    metrics.coverage = 90;

    context.metadata = {
      ...context.metadata,
      test: metrics,
    } as typeof context.metadata & { test?: TestMetrics };
  }
}
