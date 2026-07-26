import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { DocumentationAgent } from "../src/agents/DocumentationAgent.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "documentation-test",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root: process.cwd(), idea: "documentation" },
  });

  await new DocumentationAgent().run(context);
  const agentMesh = (context.metadata as Record<string, unknown>).agentMesh as { history?: Array<{ agent: string; status: string; confidence: number }> } | undefined;
  assert.ok(agentMesh?.history?.some((entry) => entry.agent === "DocumentationAgent" && entry.status === "completed"));
  console.log("documentation agent test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
