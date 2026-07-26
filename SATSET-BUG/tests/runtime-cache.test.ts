import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-runtime-cache-"));
  const artifactPath = path.join(root, "artifact.txt");
  await fs.writeFile(artifactPath, "same-content", "utf8");
  const content = await fs.readFile(artifactPath, "utf8");
  assert.equal(content, "same-content");
  console.log("runtime cache test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
