import fs from "node:fs";
import path from "node:path";

export interface FolderGenerateResult {
  created: string[];
  errors: string[];
}

const DEFAULT_FOLDERS = ["src", "components", "pages", "lib", "hooks", "api"] as const;

export class FolderGenerator {
  generate(outputDir: string, folders: string[] = [...DEFAULT_FOLDERS]): FolderGenerateResult {
    const created: string[] = [];
    const errors: string[] = [];

    for (const folder of folders) {
      const target = path.join(outputDir, folder);
      try {
        fs.mkdirSync(target, { recursive: true });
        created.push(target);
      } catch (err) {
        errors.push(`failed to create ${folder}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { created, errors };
  }
}
