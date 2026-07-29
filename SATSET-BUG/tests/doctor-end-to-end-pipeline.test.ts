import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Doctor } from "../src/doctor/Doctor.js";
import type { Context } from "../src/core/Context.js";
import type { IReporter } from "../src/report/IReporter.js";

class TrackingReporter implements IReporter {
  public readonly name = "Tracking Reporter";

  report(context: Context) {
    context.metadata = {
      ...context.metadata,
      reporterVisited: true,
    } as typeof context.metadata & { reporterVisited?: boolean };

    return context.getIssues();
  }
}

class TrackingReporterRegistry {
  registerDefaults(manager: { register(reporter: IReporter): void }): void {
    manager.register(new TrackingReporter());
  }
}

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-doctor-e2e-"));
  await fs.writeFile(
    path.join(root, "package.json"),
    JSON.stringify({ name: "doctor-e2e", private: true }, null, 2),
    "utf8"
  );

  const doctor = new Doctor(
    {
      projectRoot: root,
      projectName: "doctor-e2e",
      nodeVersion: process.version,
      pnpmVersion: "unknown",
      typescriptVersion: "unknown",
      prismaVersion: "unknown",
      nextVersion: "unknown",
      issues: [],
      recommendations: [],
      metadata: { root },
      repairOptions: { dryRun: true },
    },
    {
      skipBenchmark: true,
      reporterRegistry: new TrackingReporterRegistry() as never,
    }
  );

  const { context } = await doctor.runWithMetrics();
  const metadata = context.metadata as Record<string, unknown> & { reporterVisited?: boolean; repairExecutionCompleted?: boolean };

  assert.ok(metadata.compile, "compile stage should populate metadata");
  assert.ok(metadata.test, "test stage should populate metadata");
  assert.ok(context.repairLoop, "repair stage should populate context.repairLoop");
  assert.ok(context.verification, "verification stage should populate context.verification");
  assert.equal(metadata.reporterVisited, true, "reporting stage should be reached");
  assert.equal(metadata.repairExecutionCompleted, true, "repair execution completion should be tracked in metadata");
  assert.equal((metadata as Record<string, unknown>).repairLoop, undefined, "repairLoop should not be duplicated in metadata");

  console.log("doctor end-to-end pipeline test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});