import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { PerformanceAgent } from "../src/agents/PerformanceAgent.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "performance-test",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root: process.cwd(), idea: "performance" },
  });

  await new PerformanceAgent().run(context);
  const agentMesh = (context.metadata as Record<string, unknown>).agentMesh as { history?: Array<{ agent: string; status: string; confidence: number }> } | undefined;
  assert.ok(agentMesh?.history?.some((entry) => entry.agent === "PerformanceAgent" && entry.status === "completed"));
  console.log("performance agent test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
