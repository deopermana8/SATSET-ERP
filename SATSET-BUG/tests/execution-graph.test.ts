import assert from "node:assert/strict";
import { ExecutionGraph } from "../src/runtime/ExecutionGraph.js";

async function main(): Promise<void> {
  const graph = new ExecutionGraph().createGraph([]);
  assert.ok(graph.nodes.some((node) => node.id === "compile"));
  assert.ok(graph.edges.some((edge) => edge.from === "repair" && edge.to === "benchmark"));
  console.log("execution graph test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
