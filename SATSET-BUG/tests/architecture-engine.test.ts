import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { ArchitectureEngine } from "../src/architecture/ArchitectureEngine.js";

describe("architecture engine", () => {
  it("writes architecture artifacts", async () => {
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

    await new ArchitectureEngine().run(context);

    assert.ok(context.metadata.architecture);
  });
});
