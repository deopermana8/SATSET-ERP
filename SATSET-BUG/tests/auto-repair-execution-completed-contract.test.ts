import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { AutoRepairEngine } from "../src/autofix/AutoRepairEngine.js";
import { Context } from "../src/core/Context.js";
import { RollbackManager } from "../src/fixer/RollbackManager.js";
import { PrismaScanner } from "../src/scanner/PrismaScanner.js";
import { CommandExecutor } from "../src/commands/CommandExecutor.js";

class TestCommandExecutor extends CommandExecutor {
  override async prisma(args: string[], cwd?: string): Promise<{
    command: string;
    args: string[];
    exitCode: number | null;
    stdout: string;
    stderr: string;
    durationMs: number;
  }> {
    if (cwd) {
      await fs.writeFile(path.join(cwd, ".prisma-repair-marker"), "ok", "utf8");
    }

    return {
      command: "prisma",
      args,
      exitCode: 0,
      stdout: "ok",
      stderr: "",
      durationMs: 0,
    };
  }
}

class TestPrismaScanner extends PrismaScanner {
  override async scan(context: Context): Promise<void> {
    (context as unknown as { metadata: Record<string, unknown> }).metadata = {
      ...(context.metadata as Record<string, unknown>),
      prisma: {
        hasNamespacePrisma: true,
        hasPrismaClient: true,
        hasKnownRequestError: true,
        hasPrismaPromise: true,
        runtimeExists: true,
        generatedPrismaExists: true,
        schemaExists: true,
        hasGenerator: true,
        hasDatasource: true,
      },
    };
  }
}

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "auto-repair-contract-"));
  const context = new Context({
    projectRoot: root,
    projectName: "auto-repair-contract",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root },
  });

  await new AutoRepairEngine(new TestCommandExecutor(), new RollbackManager(), new TestPrismaScanner()).run(context);

  const metadata = context.metadata as Record<string, unknown> & { repairExecutionCompleted?: boolean };
  assert.equal(metadata.repairExecutionCompleted, true, "AutoRepairEngine should materialize repairExecutionCompleted as a boolean");
  assert.ok(context.repairLoop, "repairLoop state should remain populated on the context");
  assert.equal((metadata as Record<string, unknown>).repairLoop, undefined, "repairLoop should not be duplicated in metadata");

  console.log("auto repair execution completed contract test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
