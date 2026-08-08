import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { generate } from "../generators/index.js";
import { parseCustomerSpecYaml } from "../parser/index.js";
import type { GeneratedFile } from "../generators/generatedFile.js";
import { compareSnapshot, assertSnapshotMatch, type SnapshotCompareResult } from "./snapshotComparer.js";
import { loadSnapshot, normalizeGeneratedFiles, saveSnapshot } from "./snapshot.js";

export interface SnapshotRunnerOptions {
  specPath?: string;
  snapshotPath?: string;
}

function printSnapshotSummary(result: SnapshotCompareResult, pass: boolean): void {
  console.log("Snapshot Result");
  console.log(`Files Compared: ${result.filesCompared}`);
  console.log(`Added: ${result.added.length}`);
  console.log(`Removed: ${result.removed.length}`);
  console.log(`Changed: ${result.changed.length}`);
  console.log(pass ? "PASS" : "FAIL");
}

function createInitialResult(files: GeneratedFile[]): SnapshotCompareResult {
  return {
    filesCompared: files.length,
    added: files.map((file) => file.path),
    removed: [],
    changed: [],
    pass: true
  };
}

export async function runSnapshotRunner(options: SnapshotRunnerOptions = {}): Promise<void> {
  const specPathArg = options.specPath ?? "packages/dst/schemas/customer.dst.yaml";
  const snapshotPathArg = options.snapshotPath ?? "packages/dst/snapshots/customer.snapshot.json";

  const specPath = resolve(process.cwd(), specPathArg);
  const yamlSource = await readFile(specPath, "utf8");
  const spec = parseCustomerSpecYaml(yamlSource);
  const files = normalizeGeneratedFiles(generate(spec));

  const existingSnapshot = await loadSnapshot(snapshotPathArg);
  if (!existingSnapshot) {
    await saveSnapshot(snapshotPathArg, files);
    const initialResult = createInitialResult(files);
    printSnapshotSummary(initialResult, true);
    return;
  }

  const result = compareSnapshot(existingSnapshot.files, files);
  printSnapshotSummary(result, result.pass);
  assertSnapshotMatch(result, existingSnapshot.files, files);
}
