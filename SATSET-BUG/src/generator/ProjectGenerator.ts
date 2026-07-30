import fs from "node:fs";
import path from "node:path";
import type { TemplateRegistry } from "../templates/TemplateRegistry.js";
import { FileWriter } from "./FileWriter.js";

export interface ProjectTemplate {
  name: string;
  description: string;
  author: string;
  version: string;
  outputDir: string;
}

export interface GenerateResult {
  success: boolean;
  files: string[];
  errors: string[];
}

export class ProjectGenerator {
  generateFromRegistry(registry: TemplateRegistry, outputDir: string): GenerateResult {
    const files: Record<string, string> = {};
    for (const template of registry.list()) {
      files[template.id] = template.content;
    }
    const writer = new FileWriter();
    const result = writer.write(files, outputDir);
    return { success: result.success, files: result.written, errors: result.errors };
  }
  generate(): string[] {
    return ["src/index.ts", "package.json", "tsconfig.json", "README.md", ".gitignore"];
  }

  generateProject(template: ProjectTemplate): GenerateResult {
    const files: string[] = [];
    const errors: string[] = [];

    try {
      fs.mkdirSync(template.outputDir, { recursive: true });
    } catch (err) {
      errors.push(`failed to create output directory: ${err instanceof Error ? err.message : String(err)}`);
      return { success: false, files, errors };
    }

    const writes: Array<{ file: string; content: string }> = [
      {
        file: "package.json",
        content: JSON.stringify({
          name: template.name,
          version: template.version,
          description: template.description,
          author: template.author,
          type: "module",
          scripts: { build: "tsc", typecheck: "tsc --noEmit" },
        }, null, 2),
      },
      {
        file: "README.md",
        content: `# ${template.name}\n\n${template.description}\n`,
      },
      {
        file: ".gitignore",
        content: "node_modules/\ndist/\n*.js.map\n",
      },
      {
        file: "tsconfig.json",
        content: JSON.stringify({
          compilerOptions: {
            target: "ES2022",
            module: "NodeNext",
            moduleResolution: "NodeNext",
            strict: true,
            outDir: "dist",
            rootDir: "src",
          },
          include: ["src"],
        }, null, 2),
      },
    ];

    for (const { file, content } of writes) {
      const filePath = path.join(template.outputDir, file);
      try {
        fs.writeFileSync(filePath, content, "utf8");
        files.push(filePath);
      } catch (err) {
        errors.push(`failed to write ${file}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { success: errors.length === 0, files, errors };
  }
}

