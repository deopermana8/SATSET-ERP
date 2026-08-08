import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { GeneratedFile } from "../generators/generatedFile.js";

export interface SnapshotDocument {
  files: GeneratedFile[];
}

export function normalizeGeneratedFiles(files: GeneratedFile[]): GeneratedFile[] {
  return [...files]
    .map((file) => ({ path: file.path, content: file.content }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export async function loadSnapshot(snapshotPathArg: string): Promise<SnapshotDocument | null> {
  const snapshotPath = resolve(process.cwd(), snapshotPathArg);

  try {
    const raw = await readFile(snapshotPath, "utf8");
    const parsed = JSON.parse(raw) as SnapshotDocument;

    if (!parsed || !Array.isArray(parsed.files)) {
      throw new Error("Invalid snapshot format: files must be an array");
    }

    return {
      files: normalizeGeneratedFiles(parsed.files)
    };
  } catch (error) {
    const isMissing = error instanceof Error && "code" in error && (error as { code?: string }).code === "ENOENT";
    if (isMissing) {
      return null;
    }

    const details = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load snapshot at ${snapshotPath}: ${details}`);
  }
}

export async function saveSnapshot(snapshotPathArg: string, files: GeneratedFile[]): Promise<void> {
  const snapshotPath = resolve(process.cwd(), snapshotPathArg);
  await mkdir(dirname(snapshotPath), { recursive: true });

  const payload: SnapshotDocument = {
    files: normalizeGeneratedFiles(files)
  };

  await writeFile(snapshotPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
