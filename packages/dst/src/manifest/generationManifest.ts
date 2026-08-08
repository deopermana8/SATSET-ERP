import type { GeneratedFile } from "../generators/generatedFile.js";
import { hashContent } from "../incremental/index.js";

export interface GenerationManifestFileEntry {
  path: string;
  generator: string;
  hash: string;
}

export interface GenerationManifest {
  version: string;
  generatedAt: string;
  fileCount: number;
  files: GenerationManifestFileEntry[];
}

const MANIFEST_VERSION = "1.0";
const latestGeneratorByPath = new Map<string, string>();

export function setLatestGeneratedFileProducers(producersByPath: Map<string, string[]>): void {
  latestGeneratorByPath.clear();

  for (const [path, producers] of producersByPath.entries()) {
    if (producers.length === 0) {
      continue;
    }

    latestGeneratorByPath.set(path, producers[0]);
  }
}

function resolveGenerator(path: string): string {
  return latestGeneratorByPath.get(path) ?? "unknown";
}

export function createGenerationManifest(files: GeneratedFile[]): GenerationManifest {
  const entries = [...files]
    .map((file) => ({
      path: file.path,
      generator: resolveGenerator(file.path),
      hash: hashContent(file.content)
    }))
    .sort((a, b) => a.path.localeCompare(b.path));

  return {
    version: MANIFEST_VERSION,
    generatedAt: new Date().toISOString(),
    fileCount: entries.length,
    files: entries
  };
}
