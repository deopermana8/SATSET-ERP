import assert from "node:assert/strict";
import { PlannerEngine } from "../src/planning/PlannerEngine.js";
import { Context } from "../src/core/Context.js";

describe("planner engine", () => {
  it("persists planning knowledge", async () => {
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
      metadata: { root: process.cwd(), idea: "demo app" },
    });

    const engine = new PlannerEngine();
    await engine.run(context);

    assert.ok(context.metadata.planning);
  });
});
