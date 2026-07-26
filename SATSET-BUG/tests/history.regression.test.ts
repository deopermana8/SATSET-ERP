import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { ProjectFingerprintCalculator } from "../src/core/ProjectFingerprint.js";
import type { Issue } from "../src/core/Issue.js";
import type { HealthSummary } from "../src/health/HealthSummary.js";
import { HistoryManager } from "../src/history/HistoryManager.js";
import type { HistoryRecord } from "../src/history/History.js";

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function createFixtureProject(root: string): Promise<void> {
  await writeJson(path.join(root, "package.json"), {
    name: "fixture-project",
    private: true,
    dependencies: {
      prisma: "^5.0.0",
      react: "^18.2.0",
    },
  });

  await writeJson(path.join(root, "tsconfig.json"), {
    compilerOptions: {
      strict: false,
      moduleResolution: "node",
    },
  });

  await fs.mkdir(path.join(root, "prisma"), { recursive: true });
  await fs.writeFile(path.join(root, "prisma", "schema.prisma"), "generator client { provider = \"prisma-client-js\" }\n", "utf8");
  await fs.mkdir(path.join(root, "node_modules", ".cache"), { recursive: true });
  await fs.writeFile(path.join(root, "node_modules", ".cache", "build.log"), "ignored cache artifact\n", "utf8");
}

function createContext(root: string): Context {
  return new Context({
    projectRoot: root,
    projectName: path.basename(root),
    nodeVersion: "v20.0.0",
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root,
      packageJson: { name: path.basename(root) },
    },
  });
}

function createIssue(id: string, severity: string): Issue {
  return {
    id,
    title: `Issue ${id}`,
    category: "test",
    severity: severity as Issue["severity"],
    message: `Message ${id}`,
  };
}

function createHealth(score: number): HealthSummary {
  return {
    score,
    grade: "C",
    status: "Fair",
    recommendation: "review",
    critical: 0,
    error: 1,
    warning: 1,
    info: 0,
    autoRepairAvailable: false,
    diagnosisConfidence: 0.75,
  };
}

function createRecord(scanId: string, issues: Issue[], health: HealthSummary): HistoryRecord {
  return {
    scanId,
    projectName: "fixture-project",
    fingerprint: {
      framework: null,
      packageManager: null,
      workspace: false,
      typescript: null,
      react: null,
      next: null,
      prisma: null,
      tailwind: null,
      turbo: null,
      database: null,
      nodeVersion: null,
      dependencyCount: 0,
      workspaceCount: 0,
      hash: scanId,
      signature: scanId,
    },
    timestamp: new Date().toISOString(),
    durationMs: 120,
    doctorVersion: "test",
    health,
    issues,
    metadata: { root: ".", packageJson: { name: "fixture-project" } },
  };
}

async function main(): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "history-regression-"));

  await createFixtureProject(tempRoot);
  const context = createContext(tempRoot);
  const calculator = new ProjectFingerprintCalculator();

  const initialFingerprint = calculator.generate(context);
  await writeJson(path.join(tempRoot, "tsconfig.json"), {
    compilerOptions: {
      strict: true,
      moduleResolution: "node",
    },
  });
  const changedFingerprint = calculator.generate(context);

  assert.notEqual(initialFingerprint.hash, changedFingerprint.hash, "fingerprint should change when tracked project files change");

  const manager = new HistoryManager(tempRoot);
  const recordA = createRecord("1", [createIssue("issue-1", "error")], createHealth(60));
  const recordB = createRecord("2", [createIssue("issue-1", "error"), createIssue("issue-2", "warning")], createHealth(70));
  manager.save(recordA);
  manager.save(recordB);

  const comparison = manager.compare("1", "2");
  assert.ok(comparison, "expected a comparison object");
  assert.deepEqual(comparison?.newIssues?.map((issue) => issue.id), ["issue-2"]);
  assert.deepEqual(comparison?.unchangedIssues?.map((issue) => issue.id), ["issue-1"]);
  assert.equal(comparison?.healthDelta, 10);
  assert.equal(comparison?.scoreDelta, 10);

  console.log("history regression test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
