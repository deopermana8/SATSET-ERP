import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { SemanticRetrieverEngine } from "../src/doctor/SemanticRetrieverEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-semantic-retrieval-"));
  const context = new Context({
    projectRoot: root,
    projectName: "semantic-retrieval",
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
          { id: "problem:typescript", kind: "problem", label: "typescript error" },
          { id: "repair:typescript", kind: "repair", label: "minimal patch" },
        ],
        edges: [{ from: "problem:typescript", to: "repair:typescript" }],
      },
    },
  });

  await new SemanticRetrieverEngine().run(context);
  const retrieval = (context.metadata as Record<string, unknown>).semanticRetrieval as { candidates: Array<{ id: string; score: number }> };
  assert.ok(retrieval.candidates.length > 0);
  assert.ok(retrieval.candidates[0].score >= 0);
  console.log("semantic retrieval test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
