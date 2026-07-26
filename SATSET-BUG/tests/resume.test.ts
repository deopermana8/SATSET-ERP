import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { ResumeEngine } from "../src/orchestrator/ResumeEngine.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "satset-orchestrator",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root: process.cwd() },
  });

  await new ResumeEngine().run(context);
  assert.equal(context.metadata?.resume?.resumed, false);

  console.log("resume test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
