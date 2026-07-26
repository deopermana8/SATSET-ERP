import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { Context } from "../src/core/Context.js";
import { PatchGeneratorEngine } from "../src/doctor/PatchGeneratorEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-patch-generator-"));
  const targetFile = path.join(root, "src", "index.ts");
  const unrelatedFile = path.join(root, "src", "keep.ts");
  await fs.mkdir(path.dirname(targetFile), { recursive: true });
  await fs.writeFile(targetFile, "export const value = 1;\n", "utf8");
  await fs.writeFile(unrelatedFile, "export const untouched = 1;\n", "utf8");

  const context = new Context({
    projectRoot: root,
    projectName: "patch-generator",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root,
      repairDecision: {
        strategy: "patch-file",
        changes: [{ filePath: targetFile, oldText: "export const value = 1;", newText: "export const value = 2;" }],
      },
    },
  });

  await new PatchGeneratorEngine().run(context);
  const targetContent = await fs.readFile(targetFile, "utf8");
  const unrelatedContent = await fs.readFile(unrelatedFile, "utf8");
  const patchSummary = (context.metadata as Record<string, unknown>).patchSummary as { applied: number };

  assert.equal(targetContent, "export const value = 2;\n");
  assert.equal(unrelatedContent, "export const untouched = 1;\n");
  assert.equal(patchSummary.applied, 1);
  console.log("patch generator test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
