import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { DatabaseGenerator } from "../src/ai/engines/DatabaseGenerator.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-database-generation-"));
  const context = new Context({
    projectRoot: root,
    projectName: "database-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "database" },
  });

  await new DatabaseGenerator().run(context);
  const output = path.join(root, "prisma", "schema.prisma");
  assert.equal(await fs.access(output).then(() => true).catch(() => false), true, "database artifact should be written");
  console.log("database generation test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
