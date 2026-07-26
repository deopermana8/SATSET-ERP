import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { SecurityAgent } from "../src/agents/SecurityAgent.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "security-test",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root: process.cwd(), idea: "security" },
  });

  await new SecurityAgent().run(context);
  const agentMesh = (context.metadata as Record<string, unknown>).agentMesh as { history?: Array<{ agent: string; status: string; confidence: number }> } | undefined;
  assert.ok(agentMesh?.history?.some((entry) => entry.agent === "SecurityAgent" && entry.status === "completed"));
  console.log("security agent test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
