import assert from "node:assert/strict";
import { Context } from "../src/core/Context.js";
import { DashboardRuntime } from "../src/doctor/DashboardRuntime.js";
import { EventBus } from "../src/doctor/EventBus.js";

describe("architecture dashboard", () => {
  it("exposes architecture view", () => {
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

    const dashboard = new DashboardRuntime(context, new EventBus());
    const snapshot = dashboard.getSnapshot();
    assert.ok(snapshot);
  });
});
