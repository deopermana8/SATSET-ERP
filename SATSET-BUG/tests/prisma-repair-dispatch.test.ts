import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { AutoRepairEngine } from "../src/autofix/AutoRepairEngine.js";
import { Context } from "../src/core/Context.js";
import type { Issue } from "../src/core/Issue.js";
import { CommandExecutor } from "../src/commands/CommandExecutor.js";
import { VerificationEngine } from "../src/doctor/VerificationEngine.js";
import { PrismaScanner } from "../src/scanner/PrismaScanner.js";
import { RollbackManager } from "../src/fixer/RollbackManager.js";

class TestCommandExecutor extends CommandExecutor {
  public readonly calls: string[] = [];

  override async prisma(args: string[], cwd?: string): Promise<{
    command: string;
    args: string[];
    exitCode: number | null;
    stdout: string;
    stderr: string;
    durationMs: number;
  }> {
    this.calls.push(args.join(" "));
    if (cwd) {
      await fs.writeFile(path.join(cwd, ".prisma-repair-marker"), "ok", "utf8");
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
  private readonly resolved: boolean;

  constructor(resolved: boolean) {
    super();
    this.resolved = resolved;
  }

  override async scan(context: Context): Promise<void> {
    const prisma = this.resolved
      ? {
          hasNamespacePrisma: true,
          hasPrismaClient: true,
          hasKnownRequestError: true,
          hasPrismaPromise: true,
          runtimeExists: true,
          generatedPrismaExists: true,
          schemaExists: true,
          hasGenerator: true,
          hasDatasource: true,
        }
      : {
          hasNamespacePrisma: false,
          hasPrismaClient: false,
          hasKnownRequestError: false,
          hasPrismaPromise: false,
          runtimeExists: false,
          generatedPrismaExists: false,
          schemaExists: false,
          hasGenerator: false,
          hasDatasource: false,
        };

    (context as unknown as { metadata: Record<string, unknown> }).metadata = {
      ...(context.metadata as Record<string, unknown>),
      prisma,
    };
  }
}

async function createContext(root: string, scanner: PrismaScanner): Promise<Context> {
  const issue: Issue = {
    id: "prisma-integrity-failed",
    title: "Prisma Client Integrity Failed",
    category: "Prisma",
    severity: "critical",
    message: "Prisma metadata failed integrity checks",
    fixes: [{ id: "generate-prisma-client", title: "Generate ulang Prisma Client", description: "Regenerate the Prisma Client to restore integrity.", risk: "low", automatic: false, steps: ["Run prisma generate in the project root."] }],
  };

  const rootCause = {
    id: "prisma-root-cause",
    title: "Prisma root cause",
    confidence: 100,
    description: "Prisma issue",
    causes: [issue.title],
    evidence: [issue],
    repairSteps: ["Run prisma generate in the project root."],
    priority: 100,
  };

  const plan = {
    id: "repair-plan-prisma",
    rootCauseId: rootCause.id,
    title: "Repair plan for Prisma",
    description: "Repair Prisma client issue",
    steps: [{ id: "prisma-step", title: "Run prisma generate in the project root.", description: "Run prisma generate in the project root.", automatic: true, estimatedTime: 60, risk: "low" as const, dependsOn: [] }],
    totalEstimatedTime: 60,
    priority: 100,
  };

  const context = new Context({
    projectRoot: root,
    projectName: "prisma-fixture",
    nodeVersion: process.version,
    pnpmVersion: "unknown",
    typescriptVersion: "unknown",
    prismaVersion: "unknown",
    nextVersion: "unknown",
    issues: [],
    recommendations: [],
    metadata: { root, packageJson: { name: "prisma-fixture" } },
    rootCauses: [rootCause as never],
    repairPlans: [plan as never],
    repairOptions: { maxSteps: 1 },
  });

  context.addIssue(issue);
  context.repairPlans = [plan as never];
  context.rootCauses = [rootCause as never];
  context.diagnosis = [{ id: issue.id, confidence: 90 }];

  return context;
}

test("Prisma repair dispatch uses Prisma remediation and not tsconfig", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "prisma-dispatch-"));
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({ name: "fixture" }, null, 2), "utf8");
  await fs.mkdir(path.join(root, "prisma"), { recursive: true });
  await fs.writeFile(path.join(root, "prisma", "schema.prisma"), "generator client { provider = \"prisma-client-js\" }\n", "utf8");

  const executor = new TestCommandExecutor();
  const scanner = new TestPrismaScanner(true);
  const repairEngine = new AutoRepairEngine(executor as unknown as CommandExecutor, new RollbackManager(), scanner);
  const context = await createContext(root, scanner);

  await repairEngine.run(context);

  const repairLog = context.repairLog ?? [];
  const appliedLog = repairLog.find((entry) => entry.status === "applied");

  assert.ok(appliedLog, "expected a repair log entry");
  assert.match(appliedLog?.message ?? "", /prisma/i);
  assert.equal(executor.calls[0], "generate", "expected prisma generate to be invoked");
  assert.equal(await fs.access(path.join(root, "tsconfig.json")).then(() => true).catch(() => false), false, "tsconfig.json should not be written as a Prisma substitute");
  assert.equal(context.repairLoop?.reason, "resolved");
});

test("Ineffective Prisma repair leaves issue unresolved and verification fails", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "prisma-ineffective-"));
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({ name: "fixture" }, null, 2), "utf8");
  const executor = new TestCommandExecutor();
  const scanner = new TestPrismaScanner(false);
  const repairEngine = new AutoRepairEngine(executor as unknown as CommandExecutor, new RollbackManager(), scanner);
  const context = await createContext(root, scanner);

  await repairEngine.run(context);
  const verificationEngine = new VerificationEngine();
  await verificationEngine.run(context);
  const verification = context.verification as { passed?: boolean; reasons?: string[] } | undefined;

  assert.equal(context.repairLoop?.reason, "ineffective");
  assert.equal(context.getIssues().length, 1, "Prisma issue should remain after ineffective repair");
  assert.equal(verification?.passed, false);
  assert.ok((verification?.reasons ?? []).length > 0);
});

test("Successful Prisma repair clears targeted issues and verification passes", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "prisma-success-"));
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({ name: "fixture" }, null, 2), "utf8");
  const executor = new TestCommandExecutor();
  const scanner = new TestPrismaScanner(true);
  const repairEngine = new AutoRepairEngine(executor as unknown as CommandExecutor, new RollbackManager(), scanner);
  const context = await createContext(root, scanner);

  await repairEngine.run(context);
  const verificationEngine = new VerificationEngine();
  await verificationEngine.run(context);
  const verification = context.verification as { passed?: boolean } | undefined;

  assert.equal(context.repairLoop?.reason, "resolved");
  assert.equal(context.getIssues().length, 0, "Successful repair should remove targeted issues");
  assert.equal(verification?.passed, true);
});
