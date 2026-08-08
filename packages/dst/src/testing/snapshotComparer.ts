import type { GeneratedFile } from "../generators/generatedFile.js";

export interface SnapshotChangedFile {
  path: string;
  expected: string;
  actual: string;
}

export interface SnapshotCompareResult {
  filesCompared: number;
  added: string[];
  removed: string[];
  changed: SnapshotChangedFile[];
  pass: boolean;
}

function buildMismatchError(path: string, expected: string, actual: string): Error {
  return new Error(`Snapshot mismatch:\n${path}\n\nExpected:\n${expected}\n\nActual:\n${actual}`);
}

export function compareSnapshot(expectedFiles: GeneratedFile[], actualFiles: GeneratedFile[]): SnapshotCompareResult {
  const expectedByPath = new Map(expectedFiles.map((file) => [file.path, file.content]));
  const actualByPath = new Map(actualFiles.map((file) => [file.path, file.content]));

  const added: string[] = [];
  const removed: string[] = [];
  const changed: SnapshotChangedFile[] = [];

  for (const [path, actualContent] of actualByPath) {
    if (!expectedByPath.has(path)) {
      added.push(path);
      continue;
    }

    const expectedContent = expectedByPath.get(path);
    if (expectedContent !== actualContent) {
      changed.push({
        path,
        expected: expectedContent ?? "",
        actual: actualContent
      });
    }
  }

  for (const path of expectedByPath.keys()) {
    if (!actualByPath.has(path)) {
      removed.push(path);
    }
  }

  const pass = added.length === 0 && removed.length === 0 && changed.length === 0;

  return {
    filesCompared: Math.max(expectedFiles.length, actualFiles.length),
    added,
    removed,
    changed,
    pass
  };
}

export function assertSnapshotMatch(result: SnapshotCompareResult, expectedFiles: GeneratedFile[], actualFiles: GeneratedFile[]): void {
  if (result.pass) {
    return;
  }

  if (result.changed.length > 0) {
    const first = result.changed[0];
    throw buildMismatchError(first.path, first.expected, first.actual);
  }

  if (result.removed.length > 0) {
    const path = result.removed[0];
    const expected = expectedFiles.find((file) => file.path === path)?.content ?? "<missing>";
    throw buildMismatchError(path, expected, "<missing>");
  }

  const path = result.added[0] ?? "<unknown>";
  const actual = actualFiles.find((file) => file.path === path)?.content ?? "<missing>";
  throw buildMismatchError(path, "<missing>", actual);
}
