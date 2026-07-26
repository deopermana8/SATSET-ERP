import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { KnowledgeMetricsEngine } from "../src/doctor/KnowledgeMetricsEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-knowledge-metrics-"));
  const context = new Context({
    projectRoot: root,
    projectName: "knowledge-metrics",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root,
      knowledgeGraph: {
        nodes: [{ id: "repair:one", kind: "repair", label: "one" }],
        edges: [],
      },
      repairMemory: {
        reused: true,
        entries: [{ id: "repair:one", category: "typescript", severity: "high", errors: ["TS2339"], solution: "patch" }],
      },
    },
  });

  await new KnowledgeMetricsEngine().run(context);
  const metrics = (context.metadata as Record<string, unknown>).knowledgeMetrics as { totalEntries: number; reuseRate: number };
  assert.ok(metrics.totalEntries >= 1);
  assert.ok(metrics.reuseRate >= 0);
  console.log("knowledge metrics test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
