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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

class TestCommandExecutor extends CommandExecutor {
  override async prisma(args: string[], cwd?: string): Promise<{ command: string; args: string[]; exitCode: number | null; stdout: string; stderr: string; durationMs: number }> {
    if (cwd) {
      await mkdir(path.join(cwd, ".prisma-repair-marker"), { recursive: true });
    }
    return { command: "prisma", args, exitCode: 0, stdout: "ok", stderr: "", durationMs: 0 };
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
    projectName: "memory-fixture",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, packageJson: { name: "memory-fixture" } },
  });

  const issue = { id: "memory-issue", title: "Memory issue", category: "Prisma", severity: "critical", message: "Memory issue" };
  context.addIssue({ ...issue, fixes: [{ id: "memory-fix", title: "Fix memory", description: "Fix memory", risk: "low", automatic: true, steps: ["Run repair."] }] } as never);
  context.rootCauses = [{ id: "root-memory", title: "Memory root cause", confidence: 100, description: "Memory root cause", causes: ["memory"], evidence: [context.getIssues()[0] as never], repairSteps: ["Run repair."], priority: 100 } as never];
  context.repairPlans = [{ id: "repair-plan-memory", rootCauseId: "root-memory", title: "Memory repair plan", description: "Memory repair plan", steps: [{ id: "step-1", title: "Run prisma generate in the project root.", description: "Run prisma generate in the project root.", automatic: true, estimatedTime: 60, risk: "low" as const, dependsOn: [] }], totalEstimatedTime: 60, priority: 100 } as never];
  context.diagnosis = [{ id: issue.id, confidence: 90 }];
  return context;
}

async function main(): Promise<void> {
  const cycles = 1000;
  const repairEngine = new AutoRepairEngine(new TestCommandExecutor(), new RollbackManager(), new TestPrismaScanner());
  const verificationEngine = new VerificationEngine();
  const baseline = process.memoryUsage().heapUsed / (1024 * 1024);
  let peak = baseline;
  for (let index = 0; index < cycles; index += 1) {
    const root = await mkdir(path.join(os.tmpdir(), `satset-leak-${Date.now()}-${index}`), { recursive: true });
    const context = await createContext(root);
    await repairEngine.run(context);
    await verificationEngine.run(context);
    const heapUsed = process.memoryUsage().heapUsed / (1024 * 1024);
    peak = Math.max(peak, heapUsed);
    if (index % 100 === 0) {
      globalThis.gc?.();
    }
  }
  const growth = peak - baseline;
  const payload = {
    cycles,
    baselineHeapUsedMb: baseline,
    peakHeapUsedMb: peak,
    growthMb: growth,
    stable: growth < 25,
  };
  await writeFile(path.join(rootDir, "memory-leak-report.json"), JSON.stringify(payload, null, 2), "utf8");
  if (!payload.stable) {
    throw new Error(`Heap growth exceeded threshold: ${growth.toFixed(2)} MB`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
