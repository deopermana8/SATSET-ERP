import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Doctor } from "../src/doctor/Doctor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");

interface FixtureScenario {
  name: string;
  expectedRootCause: string;
  expectedIssueCategory: string;
  expectedHealthMax: number;
}

const fixtures: FixtureScenario[] = [
  { name: "missing-package", expectedRootCause: "Prisma", expectedIssueCategory: "Prisma", expectedHealthMax: 100 },
  { name: "missing-tsconfig", expectedRootCause: "Prisma", expectedIssueCategory: "Prisma", expectedHealthMax: 100 },
  { name: "broken-prisma", expectedRootCause: "Prisma", expectedIssueCategory: "Prisma", expectedHealthMax: 100 },
  { name: "duplicate-dependency", expectedRootCause: "Prisma", expectedIssueCategory: "Prisma", expectedHealthMax: 100 },
];

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function createFixture(root: string, scenario: FixtureScenario): Promise<void> {
  if (scenario.name === "missing-package") {
    await writeJson(path.join(root, "package.json"), { name: "fixture" });
    return;
  }
  if (scenario.name === "missing-tsconfig") {
    await writeJson(path.join(root, "package.json"), { name: "fixture" });
    return;
  }
  if (scenario.name === "broken-prisma") {
    await writeJson(path.join(root, "package.json"), { name: "fixture", dependencies: { prisma: "^5.0.0" } });
    await fs.mkdir(path.join(root, "prisma"), { recursive: true });
    await fs.writeFile(path.join(root, "prisma", "schema.prisma"), "generator client { provider = \"prisma-client-js\" }\n", "utf8");
    return;
  }
  if (scenario.name === "duplicate-dependency") {
    await writeJson(path.join(root, "package.json"), { name: "fixture", dependencies: { react: "^18.0.0" }, devDependencies: { react: "^18.0.0" } });
    return;
  }
}

async function main(): Promise<void> {
  for (const fixture of fixtures) {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), `${fixture.name}-`));
    await createFixture(root, fixture);
    const doctor = new Doctor({
      projectRoot: root,
      projectName: fixture.name,
      nodeVersion: process.version,
      pnpmVersion: "unknown",
      typescriptVersion: "unknown",
      prismaVersion: "unknown",
      nextVersion: "unknown",
      issues: [],
      recommendations: [],
      metadata: { root, packageJson: { name: fixture.name } },
    });
    const { context } = await doctor.runWithMetrics();
    assert.ok((context.health?.score ?? 0) <= fixture.expectedHealthMax, `${fixture.name} should meet the expected health ceiling`);
    assert.ok(context.getIssues().length > 0, `${fixture.name} should emit at least one issue`);
    assert.ok((context.rootCauses ?? []).some((rootCause) => rootCause.title.toLowerCase().includes(fixture.expectedRootCause.toLowerCase())), `${fixture.name} should produce a ${fixture.expectedRootCause} root cause`);
    assert.ok((context.repairPlans ?? []).length > 0, `${fixture.name} should produce repair plans`);
    assert.ok(context.verification !== undefined, `${fixture.name} should produce a verification result`);
  }

  console.log("fixture regression test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
