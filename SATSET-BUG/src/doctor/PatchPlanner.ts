import path from "node:path";
import type { CompileDiagnostic } from "./CompileResult.js";

export interface PatchPlan {
  id: string;
  targetPath?: string;
  kind: "file-create" | "file-edit" | "dependency-install" | "command";
  summary: string;
  description: string;
  patch: string;
}

export class PatchPlanner {
  plan(diagnostics: readonly CompileDiagnostic[]): PatchPlan[] {
    return diagnostics
      .map((diagnostic) => this.planDiagnostic(diagnostic))
      .filter((plan): plan is PatchPlan => plan !== undefined);
  }

  private planDiagnostic(diagnostic: CompileDiagnostic): PatchPlan | undefined {
    const message = diagnostic.message.toLowerCase();
    if (message.includes("jsx") || message.includes("react/jsx-runtime")) {
      return {
        id: `patch-${diagnostic.file ?? "jsx"}`,
        targetPath: diagnostic.file ? path.normalize(diagnostic.file) : undefined,
        kind: "dependency-install",
        summary: "Install JSX runtime dependencies",
        description: "Add the React JSX runtime packages needed to compile TSX sources.",
        patch: "npm install react react-dom @types/react @types/react-dom",
      };
    }

    if (message.includes("cannot find name") || message.includes("does not exist")) {
      return {
        id: `patch-${diagnostic.file ?? "missing-types"}`,
        targetPath: diagnostic.file ? path.normalize(diagnostic.file) : undefined,
        kind: "file-edit",
        summary: "Add missing type declarations",
        description: "Adjust the generated project configuration for Node and test globals.",
        patch: "",
      };
    }

    return undefined;
  }
}
