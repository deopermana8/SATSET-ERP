import { BuildErrorType, Diagnostic, ProjectInfo, RuleRegistryReport } from "./types.js";

interface FileSystemModule {
  existsSync(path: string): boolean;
}

interface PathModule {
  join(...paths: string[]): string;
}

const fs = require("node:fs") as FileSystemModule;
const path = require("node:path") as PathModule;

export interface DoctorResult {
  diagnostics: Diagnostic[];
  ok: boolean;
  registry: RuleRegistryReport;
}

export interface IDoctor {
  run(project: ProjectInfo, registry: RuleRegistryReport, identityFindings?: readonly Diagnostic[]): DoctorResult;
}

export class Doctor implements IDoctor {
  run(project: ProjectInfo, registry: RuleRegistryReport, identityFindings: readonly Diagnostic[] = []): DoctorResult {
    const diagnostics: Diagnostic[] = [
      this.makeDiagnostic(fs.existsSync(project.rootDir), "Workspace detected", project.rootDir),
      this.makeDiagnostic(fs.existsSync(path.join(project.rootDir, "prisma", "schema.prisma")), "Prisma schema checked", path.join(project.rootDir, "prisma", "schema.prisma")),
      this.makeDiagnostic(project.tsconfigFiles.length > 0, "TypeScript config checked", project.tsconfigFiles[0] ?? ""),
      this.makeDiagnostic(project.packageJsonFiles.length > 0, "package.json checked", project.packageJsonFiles[0] ?? ""),
      this.makeDiagnostic(registry.count > 0, "Rule registry checked", registry.names.join(", "))
    ];

    diagnostics.push(...identityFindings);

    return {
      diagnostics,
      ok: diagnostics.every((item) => item.category !== "UNKNOWN"),
      registry
    };
  }

  private makeDiagnostic(ok: boolean, message: string, file: string): Diagnostic {
    return {
      category: ok ? BuildErrorType.TYPE_ERROR : BuildErrorType.UNKNOWN,
      code: ok ? "CHECK_OK" : "CHECK_FAIL",
      file,
      message,
      raw: message,
      source: "pnpm"
    };
  }
}
