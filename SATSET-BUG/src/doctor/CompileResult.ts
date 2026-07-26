import path from "node:path";

export type CompileDiagnosticSeverity = "error" | "warning" | "info";

export interface CompileDiagnostic {
  raw: string;
  file?: string;
  line?: number;
  column?: number;
  severity: CompileDiagnosticSeverity;
  code?: string;
  message: string;
}

export interface CompileResult {
  succeeded: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  diagnostics: CompileDiagnostic[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

export class CompileResultParser {
  static parse(output: string): CompileDiagnostic[] {
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => this.parseLine(line))
      .filter((diagnostic): diagnostic is CompileDiagnostic => diagnostic !== null);
  }

  private static parseLine(line: string): CompileDiagnostic | null {
    const fileMatch = line.match(/^(.*?)(?::(\d+))?(?::(\d+))?\s*[-–:]\s*(error|warning|info)\s*(TS\d+)?\s*:?\s*(.*)$/i);
    if (fileMatch) {
      const [, rawFile, rawLine, rawColumn, severityText, code, message] = fileMatch;
      const severity = this.toSeverity(severityText);
      const normalizedFile = rawFile.trim();
      const normalizedFilePath = normalizedFile && normalizedFile !== "error" && normalizedFile !== "warning" && normalizedFile !== "info"
        ? path.normalize(normalizedFile)
        : undefined;
      return {
        raw: line,
        file: normalizedFilePath,
        line: rawLine ? Number(rawLine) : undefined,
        column: rawColumn ? Number(rawColumn) : undefined,
        severity,
        code: code?.trim() || undefined,
        message: message?.trim() || line,
      };
    }

    const tsMatch = line.match(/(error|warning|info)\s+(TS\d+)?\s*:?\s*(.*)$/i);
    if (tsMatch) {
      const [, severityText, code, message] = tsMatch;
      return {
        raw: line,
        severity: this.toSeverity(severityText),
        code: code?.trim() || undefined,
        message: message?.trim() || line,
      };
    }

    return null;
  }

  private static toSeverity(value: string): CompileDiagnosticSeverity {
    const normalized = value.toLowerCase();
    if (normalized.includes("warning")) {
      return "warning";
    }
    if (normalized.includes("info")) {
      return "info";
    }
    return "error";
  }
}
