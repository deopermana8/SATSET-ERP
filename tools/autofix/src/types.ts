export enum BuildErrorType {
  MODULE_NOT_FOUND = "MODULE_NOT_FOUND",
  TYPE_ERROR = "TYPE_ERROR",
  PRISMA = "PRISMA",
  NEXT = "NEXT",
  ESLINT = "ESLINT",
  IDENTITY_MANUAL = "IDENTITY_MANUAL",
  UNKNOWN = "UNKNOWN"
}

export type BuildStep = "pnpm" | "tsc" | "eslint" | "next-build" | "prisma-validate";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface BuildError {
  file?: string;
  line?: number;
  column?: number;
  category: BuildErrorType;
  code?: string;
  message: string;
  raw: string;
  importSpecifier?: string;
  source: BuildStep;
}

export interface Diagnostic {
  category: BuildErrorType;
  code: string;
  file?: string;
  line?: number;
  column?: number;
  message: string;
  raw: string;
  source: BuildStep;
}

export interface BuildResult {
  command: string;
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  combinedOutput: string;
  logPath: string;
  durationMs: number;
  step: BuildStep;
}

export interface BuildPipelineResult {
  diagnostics: Diagnostic[];
  logs: BuildResult[];
  success: boolean;
}

export interface BackupResult {
  backupDirectory: string;
  files: string[];
}

export interface LogEntry {
  timestamp: string;
  rule: string;
  file: string;
  status: string;
  durationMs: number;
}

export type PatchOperationKind =
  | "update-import"
  | "update-type"
  | "rename-identifier"
  | "insert-property"
  | "remove-property"
  | "update-json"
  | "write-file";

export interface PatchOperation {
  kind: PatchOperationKind;
  file: string;
  currentValue?: string;
  nextValue?: JsonValue;
  targetName?: string;
  propertyName?: string;
  propertyType?: string;
  optional?: boolean;
  jsonPath?: string[];
}

export interface PatchPlan {
  ruleName: string;
  summary: string;
  operations: PatchOperation[];
}

export interface PatchResult {
  applied: boolean;
  ruleName: string;
  summary: string;
  files: string[];
  durationMs: number;
  errors: string[];
}

export interface ImportResolverService {
  resolveRelativeImport(fromFile: string, toFile: string): string;
  resolveImportTarget(fromFile: string, importSpecifier: string, project: ProjectInfo): string | undefined;
}

export interface RuleManifest {
  name: string;
  version: string;
  description: string;
  priority: number;
  dependencies: readonly string[];
  targets: readonly BuildErrorType[];
  capabilities: readonly string[];
}

export interface RuleContext {
  project: ProjectInfo;
  importResolver: ImportResolverService;
  diagnostics: Diagnostic[];
}

export interface Rule {
  readonly manifest: RuleManifest;
  supports(error: BuildError, context: RuleContext): boolean | Promise<boolean>;
  createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null>;
}

export interface ProjectInfo {
  rootDir: string;
  toolsDir: string;
  buildLogPath: string;
  cacheFilePath: string;
  backupRootDir: string;
  logDir: string;
  tsconfigFiles: string[];
  packageJsonFiles: string[];
  nextConfigFiles: string[];
  schemaPrismaFiles: string[];
  generatedPrismaPaths: string[];
  sourceFiles: string[];
  importableFiles: string[];
  workspacePackageJsonPath?: string;
  prismaGeneratorOutputs: Record<string, string | undefined>;
}

export interface RuleRegistryReport {
  count: number;
  names: string[];
}

export interface ProjectScanCache {
  createdAt: string;
  project: ProjectInfo;
}

declare global {
  const process: {
    argv: string[];
    env: Record<string, string | undefined>;
    exitCode?: number;
  };

  function require(moduleName: string): unknown;
}
