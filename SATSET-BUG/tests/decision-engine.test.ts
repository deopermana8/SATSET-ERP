import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { DecisionEngine } from "../src/orchestrator/DecisionEngine.js";

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

  await new DecisionEngine().run(context);
  assert.equal(context.metadata?.decision?.action, "continue");

  console.log("decision engine test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
