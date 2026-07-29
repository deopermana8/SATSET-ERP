import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AutoRepairEngine } from "../src/autofix/AutoRepairEngine.js";
import { Context } from "../src/core/Context.js";
import { CommandExecutor } from "../src/commands/CommandExecutor.js";
import { VerificationEngine } from "../src/doctor/VerificationEngine.js";
import { PrismaScanner } from "../src/scanner/PrismaScanner.js";
import { RollbackManager } from "../src/fixer/RollbackManager.js";
import { ConsoleReporter } from "../src/report/ConsoleReporter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

class TestCommandExecutor extends CommandExecutor {
  override async prisma(args: string[], cwd?: string): Promise<{ command: string; args: string[]; exitCode: number | null; stdout: string; stderr: string; durationMs: number }> {
    if (cwd) {
      await mkdir(path.join(cwd, ".prisma-repair-marker"), { recursive: true });
    }
    return {
      command: "prisma",
      args,
      exitCode: 0,
      stdout: "ok",
      stderr: "",
      durationMs: 0,
    };
  }
}

class TestPrismaScanner extends PrismaScanner {
  override async scan(context: Context): Promise<void> {
    (context as unknown as { metadata: Record<string, unknown> }).metadata = {
      ...(context.metadata as Record<string, unknown>),
      prisma: {
        hasNamespacePrisma: true,
        hasPrismaClient: true,
        hasKnownRequestError: true,
        hasPrismaPromise: true,
        runtimeExists: true,
        generatedPrismaExists: true,
        schemaExists: true,
        hasGenerator: true,
        hasDatasource: true,
      },
    };
  }
}

async function createContext(root: string): Promise<Context> {
  const context = new Context({
    projectRoot: root,
    projectName: "benchmark-fixture",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, packageJson: { name: "benchmark-fixture" } },
  });

  const issue = {
    id: "benchmark-issue",
    title: "Benchmark issue",
    category: "Prisma",
    severity: "critical",
    message: "Benchmark issue",
  };

  context.addIssue({
    ...issue,
    fixes: [{ id: "benchmark-fix", title: "Fix benchmark", description: "Fix benchmark", risk: "low", automatic: true, steps: ["Run repair."] }],
  } as never);

  context.rootCauses = [{
    id: "root-benchmark",
    title: "Benchmark root cause",
    confidence: 100,
    description: "Benchmark root cause",
    causes: ["benchmark"],
    evidence: [context.getIssues()[0] as never],
    repairSteps: ["Run repair."],
    priority: 100,
  } as never];

  context.repairPlans = [{
    id: "repair-plan-benchmark",
    rootCauseId: "root-benchmark",
    title: "Benchmark repair plan",
    description: "Benchmark repair plan",
    steps: [{ id: "step-1", title: "Run prisma generate in the project root.", description: "Run prisma generate in the project root.", automatic: true, estimatedTime: 60, risk: "low" as const, dependsOn: [] }],
    totalEstimatedTime: 60,
    priority: 100,
  } as never];

  context.diagnosis = [{ id: issue.id, confidence: 90 }];
  return context;
}

async function runBenchmark(cycles: number): Promise<Record<string, number>> {
  const repairEngine = new AutoRepairEngine(new TestCommandExecutor(), new RollbackManager(), new TestPrismaScanner());
  const verificationEngine = new VerificationEngine();
  const reporter = new ConsoleReporter();
  const start = process.hrtime.bigint();
  let totalIterations = 0;
  let totalExecutionTimeMs = 0;
  let totalReportMs = 0;
  let maxHeapUsed = 0;
  let totalHeapUsed = 0;

  for (let index = 0; index < cycles; index += 1) {
    const root = await mkdir(path.join(os.tmpdir(), `satset-benchmark-${Date.now()}-${index}`), { recursive: true });
    const context = await createContext(root);
    const cycleStart = process.hrtime.bigint();
    await repairEngine.run(context);
    await verificationEngine.run(context);
    const cycleDurationMs = Number(process.hrtime.bigint() - cycleStart) / 1e6;
    totalExecutionTimeMs += cycleDurationMs;

    const originalConsoleLog = console.log;
    console.log = () => undefined;
    try {
      const reportStart = process.hrtime.bigint();
      reporter.report(context);
      totalReportMs += Number(process.hrtime.bigint() - reportStart) / 1e6;
    } finally {
      console.log = originalConsoleLog;
    }

    const memory = process.memoryUsage();
    const heapUsed = memory.heapUsed / (1024 * 1024);
    totalHeapUsed += heapUsed;
    maxHeapUsed = Math.max(maxHeapUsed, heapUsed);
    totalIterations += context.repairLoop?.attempt ?? 0;
  }

  const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
  return {
    cycles,
    averageExecutionTimeMs: totalExecutionTimeMs / cycles,
    averageRepairIterations: totalIterations / cycles,
    averageMemoryUsageMb: totalHeapUsed / cycles,
    peakMemoryMb: maxHeapUsed,
    averageReportGenerationMs: totalReportMs / cycles,
    totalDurationMs: durationMs,
  };
}

async function main(): Promise<void> {
  const cycleSizes = [100, 500, 1000, 5000, 10000];
  const results = [] as Array<Record<string, number>>;
  for (const cycles of cycleSizes) {
    results.push(await runBenchmark(cycles));
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    results,
  };

  await writeFile(path.join(rootDir, "benchmark.json"), JSON.stringify(payload, null, 2), "utf8");

  const lines = [
    "# Benchmark Report",
    "",
    "## Summary",
    "",
    ...results.map((result) => `- ${result.cycles} cycles: avg execution ${result.averageExecutionTimeMs.toFixed(2)} ms, avg iterations ${result.averageRepairIterations.toFixed(2)}, avg memory ${result.averageMemoryUsageMb.toFixed(2)} MB, peak memory ${result.peakMemoryMb.toFixed(2)} MB, report generation ${result.averageReportGenerationMs.toFixed(2)} ms`),
    "",
    "Benchmark results were written to benchmark.json.",
  ];

  await writeFile(path.join(rootDir, "BENCHMARK_REPORT.md"), lines.join("\n"), "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
