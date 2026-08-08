import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { GeneratedFile } from "../generators/generatedFile.js";
import { createGenerationManifest } from "./generationManifest.js";

export async function writeGenerationManifest(
  files: GeneratedFile[],
  baseDir: string = process.cwd(),
  relativePath: string = ".dst/generation-manifest.json"
): Promise<string> {
  const targetPath = resolve(baseDir, relativePath);
  const manifest = createGenerationManifest(files);

  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return targetPath;
}
