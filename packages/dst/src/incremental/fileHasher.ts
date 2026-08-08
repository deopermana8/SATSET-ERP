import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export function hashContent(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export async function hashFile(path: string): Promise<string | null> {
  try {
    const content = await readFile(path, "utf8");
    return hashContent(content);
  } catch (error) {
    const code = error instanceof Error && "code" in error ? (error as { code?: string }).code : undefined;
    if (code === "ENOENT") {
      return null;
    }

    const details = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read file for hashing at ${path}: ${details}`);
  }
}
