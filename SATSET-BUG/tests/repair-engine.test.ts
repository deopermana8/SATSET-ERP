import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Doctor } from "../src/doctor/Doctor.js";

async function createProjectFixture(root: string): Promise<void> {
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({ name: "fixture-project" }, null, 2), "utf8");
}

async function main(): Promise<void> {
  const dryRunRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repair-dryrun-"));
  await createProjectFixture(dryRunRoot);
  const dryRunDoctor = new Doctor({
    projectRoot: dryRunRoot,
    projectName: "repair-dryrun",
    nodeVersion: process.version,
    pnpmVersion: "unknown",
    typescriptVersion: "unknown",
    prismaVersion: "unknown",
    nextVersion: "unknown",
    issues: [],
    recommendations: [],
    metadata: { root: dryRunRoot, packageJson: { name: "repair-dryrun" } },
    repairOptions: { dryRun: true },
  });
  const dryRunContext = await dryRunDoctor.run();
  assert.equal(await fs.access(path.join(dryRunRoot, "tsconfig.json")).then(() => true).catch(() => false), false, "dry-run should not create files");
  assert.ok((dryRunContext.repairLog ?? []).length > 0, "dry-run should emit repair logs");

  const applyRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repair-apply-"));
  await createProjectFixture(applyRoot);
  const applyDoctor = new Doctor({
    projectRoot: applyRoot,
    projectName: "repair-apply",
    nodeVersion: process.version,
    pnpmVersion: "unknown",
    typescriptVersion: "unknown",
    prismaVersion: "unknown",
    nextVersion: "unknown",
    issues: [],
    recommendations: [],
    metadata: { root: applyRoot, packageJson: { name: "repair-apply" } },
  });
  const applyContext = await applyDoctor.run();
  const tsconfigExists = await fs.access(path.join(applyRoot, "tsconfig.json")).then(() => true).catch(() => false);
  assert.equal(tsconfigExists, true, "apply mode should create a tsconfig file when needed");
  assert.ok((applyContext.repairLog ?? []).some((entry) => entry.status === "applied"), "apply mode should record applied repair steps");

  console.log("repair engine test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
