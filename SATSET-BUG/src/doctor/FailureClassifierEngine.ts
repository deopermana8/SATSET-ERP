import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";

export interface FailureReport {
  category: "typescript" | "eslint" | "dependency" | "runtime" | "test" | "infrastructure";
  severity: "low" | "medium" | "high";
  errors: string[];
}

export class FailureClassifierEngine implements IEngine {
  public readonly name = "FailureClassifierEngine";

  async run(context: Context): Promise<void> {
    const buildLoop = (context.metadata as Record<string, unknown>).buildLoop as {
      report?: {
        compilerResult?: { diagnostics?: string[] };
      };
    } | undefined;
    const diagnostics = buildLoop?.report?.compilerResult?.diagnostics ?? [];
    const errors = diagnostics.join("\n");

    let category: FailureReport["category"] = "typescript";
    let severity: FailureReport["severity"] = "medium";

    if (/eslint|lint/i.test(errors)) {
      category = "eslint";
    } else if (/cannot find module|missing dependency|ERR_MODULE_NOT_FOUND|enoent/i.test(errors)) {
      category = "dependency";
    } else if (/timeout|referenceerror|typeerror|runtime/i.test(errors)) {
      category = "runtime";
    } else if (/test|jest|vitest/i.test(errors)) {
      category = "test";
    } else if (/docker|network|infrastructure/i.test(errors)) {
      category = "infrastructure";
    }

    if (category === "typescript" || category === "runtime") {
      severity = "high";
    } else if (category === "dependency") {
      severity = "medium";
    }

    const report: FailureReport = { category, severity, errors: diagnostics };
    context.metadata = {
      ...context.metadata,
      failureReport: report,
    } as typeof context.metadata & { failureReport?: FailureReport };
  }
}
