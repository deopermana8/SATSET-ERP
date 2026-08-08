import type { GeneratedFile } from "../generators/generatedFile.js";
import { writeFilesIncrementally } from "../incremental/index.js";
import { writeGenerationManifest } from "../manifest/index.js";

export async function writeFiles(files: GeneratedFile[], baseDir: string = process.cwd()): Promise<void> {
  const summary = await writeFilesIncrementally(files, baseDir);
  await writeGenerationManifest(files, baseDir);
  console.log(`Created : ${summary.created}`);
  console.log(`Updated : ${summary.updated}`);
  console.log(`Skipped : ${summary.skipped}`);
}
