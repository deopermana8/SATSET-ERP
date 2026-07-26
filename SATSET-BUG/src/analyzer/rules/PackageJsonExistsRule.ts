import type { Context } from "../../core/Context.js";
import type { IRule } from "../IRule.js";

export class PackageJsonExistsRule implements IRule {
  public readonly id = "package-json-exists";
  public readonly name = "Package Json Exists";
  public readonly category = "package";

  public match(context: Context): boolean {
    return context.metadata.packageJson === null;
  }

  public analyze(context: Context): void {
    const contextAny = context as unknown as { issues?: unknown[] };

    if (!Array.isArray(contextAny.issues)) {
      contextAny.issues = [];
    }

    contextAny.issues.push({
      id: "package-json-not-found",
      title: "package.json not found",
      severity: "error",
      category: "package",
      message: "Project does not contain package.json.",
    });
  }
}
