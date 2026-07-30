import fs from "node:fs";
import path from "node:path";

export interface FileGeneratorInput {
  projectName: string;
  description?: string;
  author?: string;
  version?: string;
}

export interface FileGenerateResult {
  written: string[];
  errors: string[];
}

export class FileGenerator {
  generate(outputDir: string, input: FileGeneratorInput): FileGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const name = input.projectName;
    const version = input.version ?? "0.1.0";
    const description = input.description ?? "";
    const author = input.author ?? "";

    const files: Record<string, string> = {
      "package.json": JSON.stringify({
        name,
        version,
        description,
        author,
        type: "module",
        scripts: {
          build: "tsc",
          dev: "tsx src/index.ts",
          typecheck: "tsc --noEmit",
        },
        dependencies: {},
        devDependencies: {
          typescript: "^5.0.0",
          tsx: "^4.0.0",
          "@types/node": "^20.0.0",
        },
      }, null, 2),

      "README.md": `# ${name}\n\n${description}\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`,

      ".env.example": `# Environment variables\nNODE_ENV=development\nPORT=3000\nDATABASE_URL=postgresql://user:password@localhost:5432/${name}\n`,

      ".gitignore": `node_modules/\ndist/\n.env\n*.log\n.DS_Store\n`,

      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          outDir: "dist",
          rootDir: "src",
          skipLibCheck: true,
        },
        include: ["src"],
        exclude: ["node_modules", "dist"],
      }, null, 2),
    };

    try {
      fs.mkdirSync(outputDir, { recursive: true });
    } catch (err) {
      errors.push(`failed to create output directory: ${err instanceof Error ? err.message : String(err)}`);
      return { written, errors };
    }

    for (const [filename, content] of Object.entries(files)) {
      const filePath = path.join(outputDir, filename);
      try {
        fs.writeFileSync(filePath, content, "utf8");
        written.push(filePath);
      } catch (err) {
        errors.push(`failed to write ${filename}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { written, errors };
  }
}
