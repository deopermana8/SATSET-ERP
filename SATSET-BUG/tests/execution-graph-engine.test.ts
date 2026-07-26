import assert from "node:assert/strict";
import { ExecutionGraphEngine } from "../src/runtime/ExecutionGraphEngine.js";
import { Context } from "../src/core/Context.js";

describe("execution graph engine", () => {
  it("writes execution graph artifacts", async () => {
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

    await new ExecutionGraphEngine().run(context);
    assert.ok(context.metadata.executionGraph);
  });
});
