import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan, RuleContext } from "../types.js";

export default class ImportResolverRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["update-import"],
      dependencies: [],
      description: "Resolve missing relative and alias imports automatically.",
      name: "ImportResolverRule",
      priority: 200,
      targets: [BuildErrorType.MODULE_NOT_FOUND],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return error.category === BuildErrorType.MODULE_NOT_FOUND;
  }

  async createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null> {
    if (!error.file || !error.importSpecifier) {
      return null;
    }

    const target = context.importResolver.resolveImportTarget(error.file, error.importSpecifier, context.project);
    if (!target) {
      return null;
    }

    return {
      ruleName: this.manifest.name,
      summary: `Resolve import ${error.importSpecifier}`,
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
