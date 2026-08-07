import { BuildError, BuildErrorType, BuildStep, Diagnostic } from "./types.js";

export interface IErrorParser {
  parse(logContent: string): BuildError[];
  parseDiagnostics(logContent: string, source: BuildStep): Diagnostic[];
}

export class ErrorParser implements IErrorParser {
  parse(logContent: string): BuildError[] {
    return this.parseInternal(logContent, "pnpm");
  }

  parseDiagnostics(logContent: string, source: BuildStep): Diagnostic[] {
    return this.parseInternal(logContent, source).map((error) => ({
      category: error.category,
      code: error.code ?? "UNKNOWN",
      column: error.column,
      file: error.file,
      line: error.line,
      message: error.message,
      raw: error.raw,
      source: error.source
    }));
  }

  private parseInternal(logContent: string, source: BuildStep): BuildError[] {
    const blocks = logContent
      .split(/\r?\n\s*\r?\n/g)
      .map((block) => block.trim())
      .filter((block) => block.length > 0);
    const parsedErrors: BuildError[] = [];

    for (const block of blocks) {
      const error = this.parseBlock(block, source);
      if (error) {
        parsedErrors.push(error);
      }
    }

    if (parsedErrors.length > 0) {
      return this.deduplicate(parsedErrors);
    }

    if (logContent.trim().length === 0) {
      return [];
    }

    return [this.parseFallback(logContent, source)];
  }

  private parseBlock(block: string, source = "pnpm" as BuildStep): BuildError | undefined {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
    if (lines.length === 0) {
      return undefined;
    }

    const raw = lines.join("\n");
    const location = this.extractLocation(raw);
    const message = this.extractMessage(lines);
    const category = this.classify(raw, message);
    const code = this.extractCode(raw);
    const importSpecifier = this.extractImportSpecifier(raw);

    if (category === BuildErrorType.UNKNOWN && !location.file && !/error|failed|cannot|missing/i.test(raw)) {
      return undefined;
    }

    return {
      file: location.file,
      line: location.line,
      column: location.column,
      category,
      code,
      message,
      raw,
      importSpecifier,
      source
    };
  }

  private parseFallback(raw: string, source: BuildStep): BuildError {
    return {
      category: this.classify(raw, raw),
      code: this.extractCode(raw),
      message: raw.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0)[0] ?? raw.trim(),
      raw,
      importSpecifier: this.extractImportSpecifier(raw),
      source
    };
  }

  private deduplicate(errors: BuildError[]): BuildError[] {
    const seen = new Set<string>();
    const uniqueErrors: BuildError[] = [];

    for (const error of errors) {
      const key = [error.file, error.line, error.column, error.category, error.code, error.message].join("|");
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      uniqueErrors.push(error);
    }

    return uniqueErrors;
  }

  private classify(raw: string, message: string): BuildErrorType {
    if (/module not found|cannot find module|can't resolve/i.test(raw)) {
      return BuildErrorType.MODULE_NOT_FOUND;
    }

    if (/schema\.prisma|@prisma\/client|prisma/i.test(raw) && /error|failed|invalid|missing|cannot|unknown/i.test(raw)) {
      return BuildErrorType.PRISMA;
    }

    if (/next\.js|next\/dist|route segment config|app router|prerender|next build/i.test(raw)) {
      return BuildErrorType.NEXT;
    }

    if (/eslint|\beslint\b|\serror\s+.+\s+@?typescript-eslint\//i.test(raw)) {
      return BuildErrorType.ESLINT;
    }

    if (/\btype error\b|error\s+ts\d{4}|is not assignable|property\s+['"`].+['"`]\s+(is missing|does not exist)|expected\s+\d+\s+arguments/i.test(raw)) {
      return BuildErrorType.TYPE_ERROR;
    }

    return /error|failed/i.test(message) ? BuildErrorType.UNKNOWN : BuildErrorType.UNKNOWN;
  }

  private extractMessage(lines: string[]): string {
    for (const line of lines) {
      const cleaned = line.replace(/^error\s+-\s+/i, "").trim();
      if (/error|failed|cannot|missing|assignable|not found/i.test(cleaned)) {
        return cleaned;
      }
    }

    return lines[0] ?? "";
  }

  private extractCode(raw: string): string | undefined {
    const codePatterns = [/\bTS\d{4}\b/i, /\bEslint\(([^)]+)\)/i, /\b([a-z-]+\/[a-z-]+)\b/i];

    for (const pattern of codePatterns) {
      const match = raw.match(pattern);
      if (match?.[0]) {
        return match[1] ?? match[0].toUpperCase();
      }
    }

    return undefined;
  }

  private extractImportSpecifier(raw: string): string | undefined {
    const patterns = [
      /(?:Cannot find module|Module not found: Can't resolve)\s+['"`]([^'"`]+)['"`]/i,
      /from\s+['"`]([^'"`]+)['"`]/i,
      /import\s+['"`]([^'"`]+)['"`]/i
    ];

    for (const pattern of patterns) {
      const match = raw.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return undefined;
  }

  private extractLocation(raw: string): Pick<BuildError, "file" | "line" | "column"> {
    const patterns = [
      /(?<file>(?:[A-Za-z]:)?[^\r\n:]+\.(?:ts|tsx|js|jsx|mjs|cjs|prisma)):(?<line>\d+):(?<column>\d+)/,
      /(?<file>(?:[A-Za-z]:)?[^\r\n:]+\.(?:ts|tsx|js|jsx|mjs|cjs|prisma))\((?<line>\d+),(?<column>\d+)\)/,
      /(?<file>(?:[A-Za-z]:)?[^\r\n:]+\.(?:ts|tsx|js|jsx|mjs|cjs|prisma)):(?<line>\d+)/,
      /(?<file>(?:[A-Za-z]:)?[^\r\n:]+\.(?:ts|tsx|js|jsx|mjs|cjs|prisma))/
    ];

    for (const pattern of patterns) {
      const match = raw.match(pattern);
      if (!match?.groups?.file) {
        continue;
      }

      return {
        file: match.groups.file,
        line: match.groups.line ? Number(match.groups.line) : undefined,
        column: match.groups.column ? Number(match.groups.column) : undefined
      };
    }

    return {};
  }
}
