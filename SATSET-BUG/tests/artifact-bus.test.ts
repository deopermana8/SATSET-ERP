import assert from "node:assert/strict";
import { ArtifactBus } from "../src/runtime/ArtifactBus.js";
import { Context } from "../src/core/Context.js";

async function main(): Promise<void> {
  const context = new Context({ projectRoot: process.cwd(), projectName: "artifact-bus", nodeVersion: process.version, pnpmVersion: "9.0.0", typescriptVersion: "5.8.3", prismaVersion: "5.0.0", nextVersion: "14.0.0", issues: [], recommendations: [], metadata: { root: process.cwd(), idea: "artifact" } });
  const bus = new ArtifactBus();
  bus.publish({ id: "artifact-1", engine: "TestEngine", kind: "artifact", payload: { hello: "world" }, outputPath: "knowledge/test.json", timestamp: new Date().toISOString() });
  const messages = bus.drain();
  assert.equal(messages.length, 1);
  console.log("artifact bus test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
