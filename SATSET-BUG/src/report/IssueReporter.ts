import type { Context } from "../core/Context.js";
import type { Issue } from "../core/Issue.js";
import type { IReporter } from "./IReporter.js";

export class IssueReporter implements IReporter {
  public readonly name = "Issue Reporter";

  public report(context: Context): Issue[] {
    const contextAny = context as unknown as { issues?: Issue[] };
    const issues = Array.isArray(contextAny.issues) ? contextAny.issues : [];

    return [...issues];
  }
}
