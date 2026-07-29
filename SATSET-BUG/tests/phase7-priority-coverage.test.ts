import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { RepairLoopEngine } from "../src/ai/engines/RepairLoopEngine.js";
import { AutoRepairEngine } from "../src/autofix/AutoRepairEngine.js";
import { VerificationEngine } from "../src/doctor/VerificationEngine.js";
import { BuildVerifier } from "../src/doctor/BuildVerifier.js";
import { DoctorOrchestrator } from "../src/doctor/DoctorOrchestrator.js";
import { ProductionValidator } from "../src/validation/ProductionValidator.js";
import { CommandExecutor } from "../src/commands/CommandExecutor.js";
import { RollbackManager } from "../src/fixer/RollbackManager.js";
import { PrismaScanner } from "../src/scanner/PrismaScanner.js";

class ExitCommandExecutor extends CommandExecutor {
  constructor(private readonly prismaExitCode: number) {
    super();
  }

  override async prisma(args: string[], _cwd?: string) {
    return {
      command: "prisma",
      args,
      exitCode: this.prismaExitCode,
      stdout: this.prismaExitCode === 0 ? "ok" : "",
      stderr: this.prismaExitCode === 0 ? "" : "failed",
      durationMs: 0,
    };
  }
}

class ScannerByFlag extends PrismaScanner {
  constructor(private readonly shouldResolve: boolean) {
    super();
  }

  override async scan(context: Context): Promise<void> {
    (context as unknown as { metadata: Record<string, unknown> }).metadata = {
      ...(context.metadata as Record<string, unknown>),
      prisma: {
        hasNamespacePrisma: this.shouldResolve,
        hasPrismaClient: this.shouldResolve,
        hasKnownRequestError: this.shouldResolve,
        hasPrismaPromise: this.shouldResolve,
        runtimeExists: this.shouldResolve,
        generatedPrismaExists: this.shouldResolve,
        schemaExists: this.shouldResolve,
        hasGenerator: this.shouldResolve,
        hasDatasource: this.shouldResolve,
      },
    };
  }
}

function makeIssue(id: string, severity: "critical" | "error" | "warning" | "info" = "error") {
  return {
    id,
    title: id,
    category: "Prisma",
    severity,
    message: `${id} message`,
    ruleId: id,
    file: "test.ts",
    line: 1,
    fixes: [{ id: `${id}-fix`, title: "Run prisma generate in the project root.", description: "Run prisma generate in the project root.", risk: "low", automatic: true, steps: ["Run repair."] }],
  } as never;
}

function makePlan(rootCauseId: string, id = "plan-1") {
  return {
    id,
    rootCauseId,
    title: "Plan",
    description: "Plan",
    steps: [{ id: "step-1", title: "Run prisma generate in the project root.", description: "Run prisma generate in the project root.", automatic: true, estimatedTime: 1, risk: "low", dependsOn: [] }],
    totalEstimatedTime: 1,
    priority: 1,
  } as never;
}

function makeRootCause(issue = makeIssue("i1"), id = "rc-1") {
  return {
    id,
    title: "Root",
    confidence: 90,
    description: "Root",
    causes: ["Prisma"],
    evidence: [issue],
    repairSteps: ["Run repair"],
    priority: 1,
  } as never;
}

function makeContext(root: string): Context {
  return new Context({
    projectRoot: root,
    projectName: "phase7-priority",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });
}

async function coverRepairLoopAndAutoRepair(root: string): Promise<void> {
  const noIssueContext = makeContext(root);
  await new RepairLoopEngine().run(noIssueContext);
  assert.equal(noIssueContext.repairLoop?.reason, "no-issues");

  const baseIssue = makeIssue("auto-1");
  const rootCause = makeRootCause(baseIssue, "rc-auto");

  const failCtx = makeContext(root);
  failCtx.addIssue(baseIssue);
  failCtx.rootCauses = [rootCause];
  failCtx.repairPlans = [makePlan(rootCause.id, "plan-fail")];
  await new AutoRepairEngine(new ExitCommandExecutor(1), new RollbackManager(), new ScannerByFlag(true)).run(failCtx);
  assert.equal(failCtx.repairLoop?.completed, true);

  const ineffectiveCtx = makeContext(root);
  ineffectiveCtx.addIssue(makeIssue("auto-2"));
  ineffectiveCtx.rootCauses = [makeRootCause(makeIssue("auto-2"), "rc-ineffective")];
  ineffectiveCtx.repairPlans = [makePlan("rc-ineffective", "plan-ineffective")];
  await new AutoRepairEngine(new ExitCommandExecutor(0), new RollbackManager(), new ScannerByFlag(false)).run(ineffectiveCtx);
  assert.equal(ineffectiveCtx.repairSummary?.remainingIssueCount !== undefined, true);

  const successCtx = makeContext(root);
  successCtx.addIssue(makeIssue("auto-3"));
  successCtx.rootCauses = [makeRootCause(makeIssue("auto-3"), "rc-success")];
  successCtx.repairPlans = [makePlan("rc-success", "plan-success")];
  await new AutoRepairEngine(new ExitCommandExecutor(0), new RollbackManager(), new ScannerByFlag(true)).run(successCtx);
  assert.equal(successCtx.repairLoop?.completed, true);

  const dryRunCtx = makeContext(root);
  dryRunCtx.repairOptions = { dryRun: true };
  dryRunCtx.addIssue(makeIssue("auto-4"));
  dryRunCtx.rootCauses = [makeRootCause(makeIssue("auto-4"), "rc-dry")];
  dryRunCtx.repairPlans = [makePlan("rc-dry", "plan-dry")];
  await new AutoRepairEngine(new ExitCommandExecutor(0), new RollbackManager(), new ScannerByFlag(true)).run(dryRunCtx);
  assert.equal(dryRunCtx.repairLoop?.completed, true);
}

async function coverVerificationBranches(root: string): Promise<void> {
  const engine = new VerificationEngine() as unknown as {
    run: (context: Context) => Promise<void>;
    verifyDiagnosis: (context: Context) => { passed: boolean };
    verifyRepairPlan: (context: Context) => { passed: boolean };
    verifyIssueConsistency: (context: Context) => { passed: boolean };
    verifyRepairOutcome: (context: Context) => { passed: boolean };
    verifyHealthScore: (context: Context) => { passed: boolean };
    countBySeverity: (issues: Array<{ severity: string }>) => { critical: number; error: number; warning: number; info: number };
    calculateScore: (counts: { critical: number; error: number; warning: number; info: number }, diagnosisConfidence: number, rootCauseCount: number, repairPlanCount: number, verificationPassed: boolean) => number;
    determineGrade: (score: number) => string;
    determineStatus: (score: number) => string;
  };

  const emptyCtx = makeContext(root);
  assert.equal(engine.verifyDiagnosis(emptyCtx).passed, true);
  assert.equal(engine.verifyRepairPlan(emptyCtx).passed, true);
  assert.equal(engine.verifyIssueConsistency(emptyCtx).passed, true);
  assert.equal(engine.verifyRepairOutcome(emptyCtx).passed, true);
  assert.equal(engine.verifyHealthScore(emptyCtx).passed, true);

  const issueCtx = makeContext(root);
  issueCtx.addIssue(makeIssue("v1"));
  assert.equal(engine.verifyDiagnosis(issueCtx).passed, false);

  issueCtx.diagnosis = [{ id: "unknown", title: "x", confidence: 10 } as never];
  assert.equal(engine.verifyDiagnosis(issueCtx).passed, false);

  issueCtx.diagnosis = [{ id: issueCtx.getIssues()[0].id, title: "x", confidence: 10 } as never, { id: issueCtx.getIssues()[0].id, title: "x", confidence: 10 } as never];
  assert.equal(engine.verifyDiagnosis(issueCtx).passed, false);

  issueCtx.diagnosis = [{ id: issueCtx.getIssues()[0].id, title: "ok", confidence: 80 } as never];
  assert.equal(engine.verifyDiagnosis(issueCtx).passed, true);

  issueCtx.rootCauses = [makeRootCause(issueCtx.getIssues()[0] as never, "rcv")];
  issueCtx.repairPlans = [];
  assert.equal(engine.verifyRepairPlan(issueCtx).passed, false);

  issueCtx.repairPlans = [makePlan("unknown", "bad-root")];
  assert.equal(engine.verifyRepairPlan(issueCtx).passed, false);

  issueCtx.repairPlans = [makePlan("rcv", "ok-plan"), makePlan("rcv", "extra-plan")];
  assert.equal(engine.verifyRepairPlan(issueCtx).passed, false);

  issueCtx.repairPlans = [{ ...makePlan("rcv", "empty-steps"), steps: [] } as never];
  assert.equal(engine.verifyRepairPlan(issueCtx).passed, false);

  issueCtx.repairPlans = [makePlan("rcv", "ok-plan")];
  assert.equal(engine.verifyRepairPlan(issueCtx).passed, true);

  const dupIssueCtx = makeContext(root);
  dupIssueCtx.issues = [
    { ...(makeIssue("dup") as unknown as Record<string, unknown>), id: "dup", message: "m1" } as never,
    { ...(makeIssue("dup") as unknown as Record<string, unknown>), id: "dup", message: "m2" } as never,
  ];
  assert.equal(engine.verifyIssueConsistency(dupIssueCtx).passed, false);

  const badIssueCtx = makeContext(root);
  badIssueCtx.issues = [{ id: "", message: "", severity: "error", title: "", category: "Prisma" } as never];
  assert.equal(engine.verifyIssueConsistency(badIssueCtx).passed, false);

  const evidenceCtx = makeContext(root);
  evidenceCtx.addIssue(makeIssue("ok"));
  evidenceCtx.diagnosis = [{ id: "missing", title: "x", confidence: 10 } as never];
  assert.equal(engine.verifyIssueConsistency(evidenceCtx).passed, false);

  const rootEvidenceCtx = makeContext(root);
  rootEvidenceCtx.addIssue(makeIssue("ok2"));
  rootEvidenceCtx.rootCauses = [makeRootCause(makeIssue("missing-id"), "rc-missing")];
  assert.equal(engine.verifyIssueConsistency(rootEvidenceCtx).passed, false);

  const noActiveIssueCtx = makeContext(root);
  noActiveIssueCtx.rootCauses = [makeRootCause(makeIssue("legacy"), "rc-legacy")];
  assert.equal(engine.verifyIssueConsistency(noActiveIssueCtx).passed, true);

  const resolvedCtx = makeContext(root);
  resolvedCtx.repairLoop = { attempt: 1, completed: true, reason: "resolved" };
  resolvedCtx.repairSummary = { beforeIssueCount: 1, afterIssueCount: 0 };
  assert.equal(engine.verifyRepairOutcome(resolvedCtx).passed, true);

  const badResolvedCtx = makeContext(root);
  badResolvedCtx.addIssue(makeIssue("still-there"));
  badResolvedCtx.repairLoop = { attempt: 1, completed: true, reason: "resolved" };
  badResolvedCtx.repairSummary = { beforeIssueCount: 1, afterIssueCount: 1 };
  assert.equal(engine.verifyRepairOutcome(badResolvedCtx).passed, false);

  const partialCtx = makeContext(root);
  partialCtx.repairLoop = { attempt: 1, completed: true, reason: "partially-resolved" };
  partialCtx.repairSummary = { beforeIssueCount: 2, afterIssueCount: 1 };
  assert.equal(engine.verifyRepairOutcome(partialCtx).passed, false);

  const ineffectiveCtx = makeContext(root);
  ineffectiveCtx.addIssue(makeIssue("vbad"));
  ineffectiveCtx.repairLoop = { attempt: 1, completed: true, reason: "ineffective" };
  ineffectiveCtx.repairSummary = { beforeIssueCount: 1, afterIssueCount: 1 };
  assert.equal(engine.verifyRepairOutcome(ineffectiveCtx).passed, false);

  const healthCtx = makeContext(root);
  healthCtx.addIssue(makeIssue("h-crit", "critical"));
  healthCtx.diagnosis = [{ id: healthCtx.getIssues()[0].id, confidence: 80 } as never];
  healthCtx.rootCauses = [makeRootCause(healthCtx.getIssues()[0] as never, "hrc")];
  healthCtx.repairPlans = [makePlan("hrc", "hplan")];
  healthCtx.repairLoop = { attempt: 1, completed: true, reason: "resolved" };
  await engine.run(healthCtx);
  assert.equal((healthCtx.verification as { passed: boolean }).passed, false);

  const counts = engine.countBySeverity([
    { severity: "critical" },
    { severity: "error" },
    { severity: "warning" },
    { severity: "info" },
  ] as never);
  assert.deepEqual(counts, { critical: 1, error: 1, warning: 1, info: 1 });
  assert.equal(engine.calculateScore(counts, 90, 1, 1, true) >= 0, true);
  assert.equal(engine.determineGrade(95), "A");
  assert.equal(engine.determineGrade(65), "D");
  assert.equal(engine.determineStatus(95), "Excellent");
  assert.equal(engine.determineStatus(55), "Critical");
}

async function coverBuildVerifier(root: string): Promise<void> {
  const context = makeContext(root);
  const verifier = new BuildVerifier();

  context.metadata = {
    ...context.metadata,
    test: {
      unitExitCode: 0,
      integrationExitCode: 0,
      e2eExitCode: null,
      coverage: 90,
      durationMs: 1,
      failedTests: [],
      logs: [],
    },
  } as never;

  context.repairLoop = { attempt: 1, completed: true, reason: "no-issues" };
  await new VerificationEngine().run(context);

  const pass = await verifier.verify(context, {
    succeeded: true,
    exitCode: 0,
    stdout: "",
    stderr: "",
    diagnostics: [],
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
  });

  assert.equal(pass.testsPassed, true);

  const failCtx = makeContext(root);
  const fail = await verifier.verify(failCtx, {
    succeeded: false,
    exitCode: 1,
    stdout: "",
    stderr: "err",
    diagnostics: [],
    errorCount: 1,
    warningCount: 0,
    infoCount: 0,
  });
  assert.equal(fail.compilePassed, false);
}

async function coverDoctorOrchestrator(root: string): Promise<void> {
  const context = makeContext(root);
  await new DoctorOrchestrator().run(context);
  assert.equal(context.metadata !== undefined, true);
}

async function coverProductionValidator(root: string): Promise<void> {
  const validator = new ProductionValidator();
  const noBenchContext = makeContext(root);
  const noBench = await validator.run(noBenchContext);
  assert.equal(Array.isArray(noBench), true);

  const benchRoot = path.join(root, "benchmarks");
  await fs.mkdir(path.join(benchRoot, "empty-project"), { recursive: true });
  const withBenchContext = makeContext(root);
  const withBench = await validator.run(withBenchContext);
  assert.equal(Array.isArray(withBench), true);
}

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "phase7-priority-coverage-"));
  await coverRepairLoopAndAutoRepair(root);
  await coverVerificationBranches(root);
  await coverBuildVerifier(root);
  await coverDoctorOrchestrator(root);
  await coverProductionValidator(root);
  console.log("phase7 priority coverage test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
