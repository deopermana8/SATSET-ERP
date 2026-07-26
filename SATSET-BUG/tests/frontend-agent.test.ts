import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { FrontendAgent } from "../src/agents/FrontendAgent.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "frontend-test",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root: process.cwd(), idea: "frontend" },
  });

  await new FrontendAgent().run(context);
  const agentMesh = (context.metadata as Record<string, unknown>).agentMesh as { history?: Array<{ agent: string; status: string; confidence: number }> } | undefined;
  assert.ok(agentMesh?.history?.some((entry) => entry.agent === "FrontendAgent" && entry.status === "completed"));
  console.log("frontend agent test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
