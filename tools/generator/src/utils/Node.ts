export interface FileSystemModule {
  appendFileSync(path: string, content: string, encoding: string): void;
  existsSync(path: string): boolean;
  mkdirSync(path: string, options?: { recursive?: boolean }): void;
  readFileSync(path: string, encoding: string): string;
  readdirSync(path: string, options?: { withFileTypes?: boolean }): string[] | DirectoryEntry[];
  writeFileSync(path: string, content: string, encoding: string): void;
}

export interface DirectoryEntry {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

export interface PathModule {
  basename(path: string, suffix?: string): string;
  delimiter: string;
  dirname(path: string): string;
  extname(path: string): string;
  isAbsolute(path: string): boolean;
  join(...paths: string[]): string;
  normalize(path: string): string;
  relative(from: string, to: string): string;
  resolve(...paths: string[]): string;
  sep: string;
}

export interface FastGlobOptions {
  absolute: boolean;
  cwd: string;
  dot: boolean;
  ignore: string[];
  onlyDirectories?: boolean;
  onlyFiles?: boolean;
  suppressErrors: boolean;
  unique: boolean;
}

export interface FastGlobFunction {
  (patterns: readonly string[] | string, options: FastGlobOptions): Promise<string[]>;
}

export interface YamlModule {
  parse(content: string): unknown;
  stringify(value: unknown): string;
}

export interface ExecaOptions {
  cwd: string;
  reject: boolean;
  stdout?: "pipe";
  stderr?: "pipe";
  timeout?: number;
}

export interface ExecaResult {
  exitCode: number;
  failed: boolean;
  stdout: string;
  stderr: string;
}

export interface ExecaModule {
  execa(command: string, arguments_: string[], options: ExecaOptions): Promise<ExecaResult>;
}

export const fs = require("node:fs") as FileSystemModule;
export const path = require("node:path") as PathModule;

export function getFastGlob(): FastGlobFunction {
  return require("fast-glob") as FastGlobFunction;
}

export function getYaml(): YamlModule {
  return require("yaml") as YamlModule;
}

export function getExeca(): ExecaModule {
  return require("execa") as ExecaModule;
}
