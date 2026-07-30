import assert from "node:assert/strict";
import { ReporterEngine, ReportEngine } from "../src/report/ReporterEngine.js";
import { ReporterManager } from "../src/report/ReporterManager.js";
import { Context } from "../src/core/Context.js";

async function main(): Promise<void> {
  // Contract: canonical engine name is "ReporterEngine" (not "ReportEngine")
  const engine = new ReporterEngine();
  assert.equal(engine.name, "ReporterEngine", "ReporterEngine.name must be 'ReporterEngine' — the canonical name for the reporting engine");

  // Contract: accepts an optional manager; default manager starts with no reporters
  const manager = new ReporterManager();
  const engineWithManager = new ReporterEngine(manager);
  assert.equal(engineWithManager.name, "ReporterEngine");
  assert.deepEqual(manager.getReporters(), []);

  // Contract: run does not throw when no reporters are registered
  const context = new Context({
    projectRoot: ".",
    projectName: "contract-test",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root: "." },
  });
  await assert.doesNotReject(() => engineWithManager.run(context));

  // Contract: reporter registered via register() is called during run
  let reporterCalled = false;
  engine.register({ report: () => { reporterCalled = true; } });
  await engine.run(context);
  assert.equal(reporterCalled, true, "registered reporter must be called during run");

  // Contract: ReportEngine is the canonical alias for ReporterEngine
  assert.strictEqual(ReportEngine, ReporterEngine, "ReportEngine alias must resolve to the same class as ReporterEngine");
  const aliasEngine = new ReportEngine();
  assert.equal(aliasEngine.name, "ReporterEngine", "ReportEngine alias must produce an engine with name 'ReporterEngine'");

  console.log("reporting engine contract test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
