import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { AutoRepairEngine } from "../src/autofix/AutoRepairEngine.js";
import { Context } from "../src/core/Context.js";
import { CommandExecutor } from "../src/commands/CommandExecutor.js";
import { VerificationEngine } from "../src/doctor/VerificationEngine.js";
import { PrismaScanner } from "../src/scanner/PrismaScanner.js";
import { RollbackManager } from "../src/fixer/RollbackManager.js";

class TestCommandExecutor extends CommandExecutor {
  constructor(private readonly exitCode: number = 0) {
    super();
  }

  override async prisma(args: string[], cwd?: string): Promise<{
    command: string;
    args: string[];
    exitCode: number | null;
    stdout: string;
    stderr: string;
    durationMs: number;
  }> {
    if (cwd) {
      await fs.writeFile(path.join(cwd, ".prisma-repair-marker"), "ok", "utf8");
    }
    return {
      command: "prisma",
      args,
      exitCode: this.exitCode,
      stdout: this.exitCode === 0 ? "ok" : "failed",
      stderr: this.exitCode === 0 ? "" : "boom",
      durationMs: 0,
    };
  }
}

class TestPrismaScanner extends PrismaScanner {
  constructor(private readonly resolved: boolean) {
    super();
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

async function createContext(root: string, issues: Array<{
  id: string;
  title: string;
  category: string;
  severity: string;
  message: string;
}>): Promise<Context> {
  const context = new Context({
    projectRoot: root,
    projectName: "repair-state-fixture",
    nodeVersion: process.version,
    pnpmVersion: "unknown",
    typescriptVersion: "unknown",
    prismaVersion: "unknown",
    nextVersion: "unknown",
    issues: [],
    recommendations: [],
    metadata: { root, packageJson: { name: "repair-state-fixture" } },
  });

  for (const issue of issues) {
    context.addIssue({
      ...issue,
      fixes: [{ id: `${issue.id}-fix`, title: `Fix ${issue.title}`, description: `Fix ${issue.title}`, risk: "low", automatic: true, steps: ["Run repair."] }],
    } as never);
  }

  const rootCauses = issues.map((issue, index) => ({
    id: `root-cause-${index}`,
    title: `Root cause for ${issue.title}`,
    confidence: 100,
    description: issue.title,
    causes: [issue.title],
    evidence: [context.getIssues().find((candidate) => candidate.id === issue.id) ?? issue],
    repairSteps: ["Run repair."],
    priority: 100,
  }));

  const repairPlans = rootCauses.map((rootCause, index) => ({
    id: `repair-plan-${index}`,
    rootCauseId: rootCause.id,
    title: `Repair plan ${index}`,
    description: `Repair plan for ${rootCause.title}`,
    steps: [{ id: `step-${index}`, title: "Run prisma generate in the project root.", description: "Run prisma generate in the project root.", automatic: true, estimatedTime: 60, risk: "low" as const, dependsOn: [] }],
    totalEstimatedTime: 60,
    priority: 100,
  }));

  context.rootCauses = rootCauses as never;
  context.repairPlans = repairPlans as never;
  context.diagnosis = issues.map((issue) => ({ id: issue.id, confidence: 90 }));
  return context;
}

test("already healthy repair state verifies and requires no repair", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "repair-already-healthy-"));
  const context = await createContext(root, []);
  const repairEngine = new AutoRepairEngine(new TestCommandExecutor(0), new RollbackManager(), new TestPrismaScanner(true));
  const verificationEngine = new VerificationEngine();

  await repairEngine.run(context);
  await verificationEngine.run(context);

  assert.equal(context.repairLoop?.reason, "no-issues");
  assert.equal(context.getIssues().length, 0);
  assert.equal((context.verification as { passed?: boolean } | undefined)?.passed, true);
});

test("ineffective repair leaves issue unresolved and verification fails", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "repair-ineffective-"));
  const context = await createContext(root, [{ id: "prisma-issue", title: "Prisma issue", category: "Prisma", severity: "critical", message: "Prisma issue remains" }]);
  const repairEngine = new AutoRepairEngine(new TestCommandExecutor(0), new RollbackManager(), new TestPrismaScanner(false));
  const verificationEngine = new VerificationEngine();

  await repairEngine.run(context);
  await verificationEngine.run(context);

  assert.equal(context.repairLoop?.reason, "ineffective");
  assert.equal(context.getIssues().length, 1);
  assert.equal((context.verification as { passed?: boolean } | undefined)?.passed, false);
  assert.equal(context.repairSummary?.afterIssueCount, 1);
});

test("successful repair clears the issue and verification passes", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "repair-success-"));
  const context = await createContext(root, [{ id: "prisma-issue", title: "Prisma issue", category: "Prisma", severity: "critical", message: "Prisma issue is repaired" }]);
  const repairEngine = new AutoRepairEngine(new TestCommandExecutor(0), new RollbackManager(), new TestPrismaScanner(true));
  const verificationEngine = new VerificationEngine();

  await repairEngine.run(context);
  await verificationEngine.run(context);

  assert.equal(context.repairLoop?.reason, "resolved");
  assert.equal(context.getIssues().length, 0);
  assert.equal((context.verification as { passed?: boolean } | undefined)?.passed, true);
  assert.equal(context.repairSummary?.afterIssueCount, 0);
  assert.ok((context.health?.score ?? 0) >= (context.repairSummary?.beforeHealth ?? 0));
});

test("failed repair execution is marked failed and verification fails", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "repair-failed-"));
  const context = await createContext(root, [{ id: "prisma-issue", title: "Prisma issue", category: "Prisma", severity: "critical", message: "Prisma issue should fail" }]);
  const repairEngine = new AutoRepairEngine(new TestCommandExecutor(1), new RollbackManager(), new TestPrismaScanner(true));
  const verificationEngine = new VerificationEngine();

  await repairEngine.run(context);
  await verificationEngine.run(context);

  assert.equal(context.repairLoop?.reason, "failed");
  assert.equal(context.getIssues().length, 1);
  assert.equal((context.verification as { passed?: boolean } | undefined)?.passed, false);
});

test("stale diagnosis and repair state is normalized after successful repair", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "repair-stale-"));
  const context = await createContext(root, [{ id: "prisma-issue", title: "Prisma issue", category: "Prisma", severity: "critical", message: "Prisma issue is repaired" }]);
  context.diagnosis = [{ id: "prisma-issue", confidence: 90 }];
  context.rootCauses = [{ id: "stale-root", title: "Stale root cause", confidence: 100, description: "stale", causes: ["prisma-issue"], evidence: [context.getIssues().find((issue) => issue.id.includes("prisma")) as never], repairSteps: ["Run repair."], priority: 100 } as never];
  context.repairPlans = [{ id: "stale-plan", rootCauseId: "stale-root", title: "Stale plan", description: "stale", steps: [{ id: "stale-step", title: "Run prisma generate in the project root.", description: "Run prisma generate in the project root.", automatic: true, estimatedTime: 60, risk: "low" as const, dependsOn: [] }], totalEstimatedTime: 60, priority: 100 } as never];

  const repairEngine = new AutoRepairEngine(new TestCommandExecutor(0), new RollbackManager(), new TestPrismaScanner(true));
  const verificationEngine = new VerificationEngine();

  await repairEngine.run(context);
  await verificationEngine.run(context);

  assert.equal(context.getIssues().length, 0);
  assert.equal((context.diagnosis ?? []).length, 0);
  assert.equal((context.rootCauses ?? []).length, 0);
  assert.equal((context.repairPlans ?? []).length, 0);
  assert.equal((context.verification as { passed?: boolean } | undefined)?.passed, true);
});

test("multiple issues keep the remaining issue active and verification fails", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "repair-multiple-"));
  const context = await createContext(root, [
    { id: "prisma-issue", title: "Prisma issue", category: "Prisma", severity: "critical", message: "Prisma issue is repaired" },
    { id: "other-issue", title: "Other issue", category: "General", severity: "critical", message: "Another issue remains" },
  ]);
  const repairEngine = new AutoRepairEngine(new TestCommandExecutor(0), new RollbackManager(), new TestPrismaScanner(true));
  const verificationEngine = new VerificationEngine();

  await repairEngine.run(context);
  await verificationEngine.run(context);

  assert.equal(context.repairLoop?.reason, "partially-resolved");
  assert.equal(context.getIssues().length, 1);
  assert.equal(context.getIssues().some((issue) => issue.id.includes("other-issue")), true);
  assert.equal((context.verification as { passed?: boolean } | undefined)?.passed, false);
  assert.ok((context.health?.score ?? 0) < 100);
});
