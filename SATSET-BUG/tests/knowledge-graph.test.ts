import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { KnowledgeGraphEngine } from "../src/doctor/KnowledgeGraphEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-knowledge-graph-"));
  const context = new Context({
    projectRoot: root,
    projectName: "knowledge-graph",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root,
      repairMemory: {
        reused: false,
        entries: [{ id: "repair:typescript:ts2339", category: "typescript", severity: "high", errors: ["TS2339"], solution: "minimal patch" }],
      },
    },
  });

  await new KnowledgeGraphEngine().run(context);
  const graph = (context.metadata as Record<string, unknown>).knowledgeGraph as { nodes: Array<{ id: string; kind: string }>; edges: Array<{ from: string; to: string }> };
  assert.ok(graph.nodes.length > 0);
  assert.ok(graph.edges.length > 0);
  console.log("knowledge graph test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
