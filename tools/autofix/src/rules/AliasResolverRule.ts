import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan, RuleContext } from "../types.js";

export default class AliasResolverRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["update-import"],
      dependencies: ["ImportResolverRule"],
      description: "Resolve workspace alias imports.",
      name: "AliasResolverRule",
      priority: 145,
      targets: [BuildErrorType.MODULE_NOT_FOUND],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return error.category === BuildErrorType.MODULE_NOT_FOUND && /^[@~]/.test(error.importSpecifier ?? "");
  }

  async createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null> {
    if (!error.file || !error.importSpecifier) {
      return null;
    }

    const cleanedSpecifier = error.importSpecifier.replace(/^[@~]\/?/, "");
    const target = context.importResolver.resolveImportTarget(error.file, cleanedSpecifier, context.project);
    if (!target) {
      return null;
    }

    return {
      ruleName: this.manifest.name,
      summary: `Resolve alias import ${error.importSpecifier}`,
      operations: [
        {
          kind: "update-import",
          file: error.file,
          currentValue: error.importSpecifier,
          nextValue: context.importResolver.resolveRelativeImport(error.file, target)
        }
      ]
    };
  }
}
