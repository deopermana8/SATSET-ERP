import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { GeneratedFile } from "../generators/generatedFile.js";
import { hashContent, hashFile } from "./fileHasher.js";

export interface IncrementalWriteSummary {
  created: number;
  updated: number;
  skipped: number;
}

function ensureValidPath(path: string, index: number): string {
  if (typeof path !== "string" || !path.trim()) {
    throw new Error(`Invalid file path at index ${index}: path must be a non-empty string`);
  }
  return path.trim();
}

export async function writeFilesIncrementally(
  files: GeneratedFile[],
  baseDir: string = process.cwd()
): Promise<IncrementalWriteSummary> {
  if (!Array.isArray(files)) {
    throw new Error("writeFiles input must be an array of GeneratedFile");
  }

  const summary: IncrementalWriteSummary = {
    created: 0,
    updated: 0,
    skipped: 0
  };

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];

    if (!file || typeof file !== "object") {
      throw new Error(`Invalid file item at index ${index}: expected object with path and content`);
    }

    const relativePath = ensureValidPath(file.path, index);
    const targetPath = resolve(baseDir, relativePath);

    if (typeof file.content !== "string") {
      throw new Error(`Invalid file content at index ${index}: content must be a string`);
    }

    const existingHash = await hashFile(targetPath);
    const generatedHash = hashContent(file.content);

    if (existingHash === null) {
      await mkdir(dirname(targetPath), { recursive: true });
      await writeFile(targetPath, file.content, "utf8");
      summary.created += 1;
      continue;
    }

    if (existingHash === generatedHash) {
      summary.skipped += 1;
      continue;
    }

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, file.content, "utf8");
    summary.updated += 1;
  }

  return summary;
}
