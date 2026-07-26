import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { AutonomousOrchestrator } from "../src/runtime/AutonomousOrchestrator.js";
import { EngineRegistry } from "../src/runtime/EngineRegistry.js";
import { AgentMeshEngine } from "../src/agents/AgentMeshEngine.js";

async function main(): Promise<void> {
  const context = new Context({
    projectRoot: process.cwd(),
    projectName: "mesh-test",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root: process.cwd(), idea: "mesh" },
  });

  const registry = new EngineRegistry();
  const orchestrator = new AutonomousOrchestrator(registry);
  const mesh = new AgentMeshEngine(orchestrator);
  await mesh.run(context);

  const agentMesh = (context.metadata as Record<string, unknown>).agentMesh as { history?: Array<{ agent: string; status: string; confidence: number }> } | undefined;
  assert.ok(agentMesh?.history && agentMesh.history.length > 0);
  assert.ok(registry.resolve("architectagent"));
  assert.ok(registry.resolve("backendagent"));
  console.log("agent mesh test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
