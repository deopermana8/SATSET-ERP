import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Context } from "../src/core/Context.js";
import DiagnosticEngine from "../src/diagnostic/DiagnosticEngine.js";
import { HealthEngine } from "../src/health/HealthEngine.js";
import { ScannerManager } from "../src/scanner/ScannerManager.js";
import { ScannerRegistry } from "../src/scanner/ScannerRegistry.js";
import { RuleEngine } from "../src/analyzer/RuleEngine.js";
import { RuleRegistry } from "../src/analyzer/RuleRegistry.js";
import { FixPlanner } from "../src/fixer/FixPlanner.js";
import { AutoPatchBuilder } from "../src/fixer/AutoPatchBuilder.js";
import { PatchVerifier } from "../src/fixer/PatchVerifier.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runDoctorFlow(projectRoot: string) {
  const metadata = {
    root: projectRoot,
    packageJson: { name: path.basename(projectRoot) },
  };

  const context = new Context({
    projectRoot,
    projectName: path.basename(projectRoot),
    nodeVersion: process.version,
    pnpmVersion: "unknown",
    typescriptVersion: "unknown",
    prismaVersion: "unknown",
    nextVersion: "unknown",
    issues: [],
    recommendations: [],
    metadata,
  });

  const scannerManager = new ScannerManager();
  const ruleEngine = new RuleEngine();
  new ScannerRegistry().registerDefaults(scannerManager);
  new RuleRegistry().registerDefaults(ruleEngine);

  await scannerManager.scanAll(context);
  await ruleEngine.run(context);

  const diagnosticEngine = new DiagnosticEngine();
  await diagnosticEngine.run(context);

  const fixPlan = new FixPlanner().plan(context);
  const patchPlans = new AutoPatchBuilder().build(fixPlan);
  const patchVerification = await new PatchVerifier().verify(patchPlans);
  const healthEngine = new HealthEngine();
  await healthEngine.run(context);

  return {
    context,
    diagnoses: context.diagnosis ?? [],
    fixPlan,
    patchPlans,
    patchVerification,
    healthScore: context.health,
  };
}

async function main() {
  const fixtureRoot = path.join(__dirname, "projects", "prisma-broken");
  const result = await runDoctorFlow(fixtureRoot);

  assert.ok(result.context.getIssues().length > 0, "expected issues from fixture");
  assert.ok(result.diagnoses.length > 0, "expected diagnosis entries from fixture");
  assert.equal(result.diagnoses[0].rootCause, "Prisma");
  assert.ok(result.healthScore?.score !== undefined && result.healthScore.score <= 100, "health score should be within range");
  assert.ok(result.fixPlan.patches.length > 0, "fix plan should include patches");
  assert.ok(result.patchVerification.summary.totalChecks > 0, "patch verification should run checks");

  console.log("doctor integration test passed");
}

void main();
