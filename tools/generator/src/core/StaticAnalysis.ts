import { FileSystem } from "../utils/FileSystem.js";
import { path } from "../utils/Node.js";

export interface StaticAnalysisIssue {
  level: "error" | "warning";
  message: string;
}

export interface StaticAnalysisReport {
  issues: StaticAnalysisIssue[];
  ok: boolean;
}

export interface IStaticAnalysis {
  analyze(generatorRoot: string, autofixRoot: string): Promise<StaticAnalysisReport>;
}

export class StaticAnalysis implements IStaticAnalysis {
  private readonly fileSystem = new FileSystem();

  async analyze(generatorRoot: string, autofixRoot: string): Promise<StaticAnalysisReport> {
    const issues: StaticAnalysisIssue[] = [];
    const files = await this.fileSystem.scan(["src/**/*.ts"], {
      absolute: true,
      cwd: generatorRoot,
      dot: false,
      ignore: [],
      onlyFiles: true,
      suppressErrors: true,
      unique: true
    });
    const autofixFiles = await this.fileSystem.scan(["src/**/*.ts"], {
      absolute: true,
      cwd: autofixRoot,
      dot: false,
      ignore: [],
      onlyFiles: true,
      suppressErrors: true,
      unique: true
    });

    const hashes = new Map<string, string[]>();
    for (const filePath of [...files, ...autofixFiles]) {
      const content = this.fileSystem.readText(filePath);
      const hash = this.fileSystem.hash(content);
      const list = hashes.get(hash) ?? [];
      list.push(filePath);
      hashes.set(hash, list);

      if (/(\/\/.*\bTODO\b|\/\*[\s\S]*?\bTODO\b[\s\S]*?\*\/)/i.test(content)) {
        issues.push({ level: "warning", message: `TODO marker found in ${filePath}` });
      }
      if (/(\bas\s+any\b|:\s*any\b|<any>)/.test(content) && !/StaticAnalysis\.ts$/i.test(filePath)) {
        issues.push({ level: "warning", message: `Potential any usage found in ${filePath}` });
      }
      if (/export\s+\{\s*\}/.test(content) && !/runtime\.ts$/i.test(filePath)) {
        issues.push({ level: "warning", message: `Empty export found in ${filePath}` });
      }
    }

    for (const [, duplicateFiles] of hashes.entries()) {
      if (duplicateFiles.length > 1) {
        const uniqueDirectories = new Set(duplicateFiles.map((filePath) => path.dirname(filePath)));
        if (uniqueDirectories.size > 1) {
          issues.push({ level: "warning", message: `Duplicate file bodies detected: ${duplicateFiles.join(", ")}` });
        }
      }
    }

    return {
      issues,
      ok: issues.every((issue) => issue.level !== "error")
    };
  }
}
