import assert from "node:assert/strict";
import { MultiAgentCoordinatorEngine } from "../src/agents/MultiAgentCoordinatorEngine.js";
import { Context } from "../src/core/Context.js";

describe("multi-agent coordinator", () => {
  it("writes coordination artifacts", async () => {
    const context = new Context({
      projectRoot: process.cwd(),
      projectName: "demo",
      nodeVersion: process.version,
      pnpmVersion: "9.0.0",
      typescriptVersion: "5.8.3",
      prismaVersion: "5.0.0",
      nextVersion: "14.0.0",
      issues: [],
      recommendations: [],
      metadata: { root: process.cwd(), idea: "demo" },
    });

    await new MultiAgentCoordinatorEngine().run(context);
    assert.ok(context.metadata.agentCoordinator);
  });
});
