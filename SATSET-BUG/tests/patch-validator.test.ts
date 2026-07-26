import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { Context } from "../src/core/Context.js";
import { PatchValidatorEngine } from "../src/doctor/PatchValidatorEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-patch-validator-"));
  const targetFile = path.join(root, "src", "index.ts");
  await fs.mkdir(path.dirname(targetFile), { recursive: true });
  await fs.writeFile(targetFile, "export const value = 2;\n", "utf8");

  const context = new Context({
    projectRoot: root,
    projectName: "patch-validator",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root,
      patchSummary: {
        applied: 1,
        changes: [{ filePath: targetFile, status: "applied" }],
      },
    },
  });

  await new PatchValidatorEngine().run(context);
  const validation = (context.metadata as Record<string, unknown>).patchValidation as { valid: boolean; checked: number };

  assert.equal(validation.valid, true);
  assert.equal(validation.checked, 1);
  console.log("patch validator test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
