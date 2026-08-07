import { BuildError, PatchPlan, Rule, RuleContext, RuleManifest } from "../types.js";

export abstract class BaseRule implements Rule {
  constructor(public readonly manifest: RuleManifest) {}

  abstract supports(error: BuildError, context: RuleContext): boolean | Promise<boolean>;

  abstract createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null>;

  protected inferContainerName(message: string): string | undefined {
    const patterns = [
      /type\s+['"`]?([A-Za-z0-9_]+)['"`]?/i,
      /interface\s+['"`]?([A-Za-z0-9_]+)['"`]?/i,
      /required in type\s+['"`]?([A-Za-z0-9_]+)['"`]?/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return undefined;
  }

  protected pickPrimaryFile(error: BuildError): string | undefined {
    return error.file;
  }
}
