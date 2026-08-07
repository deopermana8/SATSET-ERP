import { ProjectInfo } from "./types.js";

interface DirectoryEntry {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

interface FileSystemModule {
  existsSync(filePath: string): boolean;
  readFileSync(filePath: string, encoding: string): string;
  readdirSync(filePath: string, options: { withFileTypes: true }): DirectoryEntry[];
}

interface PathModule {
  basename(filePath: string): string;
  dirname(filePath: string): string;
  join(...paths: string[]): string;
  resolve(...paths: string[]): string;
}

const fs = require("node:fs") as FileSystemModule;
const path = require("node:path") as PathModule;

export interface IPrismaAnalyzer {
  readGeneratorOutput(schemaPath: string): string | undefined;
  analyze(projectInfo: ProjectInfo): ProjectInfo;
}

export class PrismaAnalyzer implements IPrismaAnalyzer {
  constructor(private readonly rootDir: string) {
    void this.rootDir;
  }

  readGeneratorOutput(schemaPath: string): string | undefined {
    if (!fs.existsSync(schemaPath)) {
      return undefined;
    }

    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    const generatorPattern = /generator\s+\w+\s*\{([\s\S]*?)\}/g;

    for (const match of schemaContent.matchAll(generatorPattern)) {
      const blockContent = match[1];
      const outputMatch = blockContent.match(/output\s*=\s*(?:env\("([^"]+)"\)|"([^"]+)")/);

      if (!outputMatch) {
        continue;
      }

      const environmentVariableName = outputMatch[1];
      if (environmentVariableName) {
        return process.env[environmentVariableName] ?? `env(${environmentVariableName})`;
      }

      return outputMatch[2];
    }

    return undefined;
  }

  analyze(projectInfo: ProjectInfo): ProjectInfo {
    const generatedPrismaPaths = [...projectInfo.generatedPrismaPaths];
    const prismaGeneratorOutputs: Record<string, string | undefined> = {};

    for (const schemaPath of projectInfo.schemaPrismaFiles) {
      const output = this.readGeneratorOutput(schemaPath);
      prismaGeneratorOutputs[schemaPath] = output;

      if (!output || output.startsWith("env(")) {
        continue;
      }

      const resolvedOutputPath = path.resolve(path.dirname(schemaPath), output);
      if (fs.existsSync(resolvedOutputPath) && !generatedPrismaPaths.includes(resolvedOutputPath)) {
        generatedPrismaPaths.push(resolvedOutputPath);
      }
    }

    return {
      ...projectInfo,
      generatedPrismaPaths,
      prismaGeneratorOutputs
    };
  }
}
