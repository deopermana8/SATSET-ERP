import type { CompileDiagnostic } from "./CompileResult.js";

export type ErrorCategory = "typescript-config" | "missing-dependency" | "syntax" | "unknown";

export interface ClassifiedError {
  category: ErrorCategory;
  confidence: number;
  diagnostic: CompileDiagnostic;
  reason: string;
}

export class ErrorClassifier {
  classify(diagnostics: readonly CompileDiagnostic[]): ClassifiedError[] {
    return diagnostics.map((diagnostic) => this.classifyOne(diagnostic));
  }

  private classifyOne(diagnostic: CompileDiagnostic): ClassifiedError {
    const message = diagnostic.message.toLowerCase();
    if (message.includes("jsx") || message.includes("react/jsx-runtime")) {
      return { category: "missing-dependency", confidence: 0.95, diagnostic, reason: "JSX compilation requires the React runtime packages." };
    }
    if (message.includes("cannot find name") || message.includes("does not exist")) {
      return { category: "typescript-config", confidence: 0.8, diagnostic, reason: "TypeScript is missing ambient types or config for the referenced symbol." };
    }
    return { category: "unknown", confidence: 0.4, diagnostic, reason: "The diagnostic did not match a known repair pattern." };
  }
}
