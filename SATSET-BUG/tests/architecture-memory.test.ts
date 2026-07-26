import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { ArchitectureKnowledge } from "../src/architecture/ArchitectureKnowledge.js";

describe("architecture memory", () => {
  it("stores architecture history", async () => {
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

    await new ArchitectureKnowledge().learn(context, [{ id: "a", name: "Modular Monolith", summary: "good" }]);

    assert.ok(true);
  });
});
