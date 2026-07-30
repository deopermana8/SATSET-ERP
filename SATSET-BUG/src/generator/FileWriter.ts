import fs from "node:fs";
import path from "node:path";

export interface WriteResult {
  success: boolean;
  written: string[];
  errors: string[];
}

export class FileWriter {
  write(files: Record<string, string>, outputDir: string): WriteResult {
    const written: string[] = [];
    const errors: string[] = [];

    try {
      fs.mkdirSync(outputDir, { recursive: true });
    } catch (err) {
      errors.push(`failed to create directory: ${err instanceof Error ? err.message : String(err)}`);
      return { success: false, written, errors };
    }

    for (const [name, content] of Object.entries(files)) {
      const filePath = path.join(outputDir, name);
      try {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content, "utf8");
        written.push(filePath);
      } catch (err) {
        errors.push(`failed to write ${name}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { success: errors.length === 0, written, errors };
  }
}
