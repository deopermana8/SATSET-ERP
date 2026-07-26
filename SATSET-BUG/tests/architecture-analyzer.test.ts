import assert from "node:assert/strict";
import { ArchitectureAnalyzer } from "../src/architecture/ArchitectureAnalyzer.js";
import { Context } from "../src/core/Context.js";

describe("architecture analyzer", () => {
  it("produces analysis values", () => {
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

    const analysis = new ArchitectureAnalyzer().analyze(context);
    assert.ok(analysis.moduleBoundaries.length > 0);
  });
});
