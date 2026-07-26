import type { Context } from "../core/Context.js";

export class RequirementAnalyzer {
  analyze(context: Context): string[] {
    const idea = typeof context.metadata?.idea === "string" ? context.metadata.idea : context.projectName;
    return [
      `Support ${idea}`,
      "Provide maintainable implementation",
      "Preserve compatibility with existing runtime",
      "Generate verifiable artifacts",
    ];
  }
}
