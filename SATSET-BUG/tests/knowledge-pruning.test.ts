import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { KnowledgePrunerEngine } from "../src/doctor/KnowledgePrunerEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-knowledge-pruning-"));
  const context = new Context({
    projectRoot: root,
    projectName: "knowledge-pruning",
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
        nodes: [
          { id: "repair:same", kind: "repair", label: "same" },
          { id: "repair:same-duplicate", kind: "repair", label: "same" },
          { id: "repair:old", kind: "repair", label: "old" },
        ],
        edges: [],
      },
    },
  });

  await new KnowledgePrunerEngine().run(context);
  const pruned = (context.metadata as Record<string, unknown>).knowledgePruning as { nodes: Array<{ id: string }> };
  assert.ok(pruned.nodes.length <= 2);
  console.log("knowledge pruning test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
