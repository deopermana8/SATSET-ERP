import fs from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const globals = globalThis as typeof globalThis & {
  describe?: (name: string, fn: () => void | Promise<void>) => void;
  it?: (name: string, fn: () => void | Promise<void>) => void;
};

globals.describe = (name, fn) => {
  void test(name, fn);
};

globals.it = (name, fn) => {
  void test(name, fn);
};

async function main(): Promise<void> {
  const entries = await fs.readdir(__dirname);
  const testFiles = entries
    .filter((entry) => entry.endsWith(".test.ts") && entry !== "run-all.ts")
    .sort()
    .map((entry) => pathToFileURL(path.join(__dirname, entry)).href);

  for (const testFile of testFiles) {
    await import(testFile);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
