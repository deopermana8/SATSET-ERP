import { BaseRule } from "./BaseRule.js";
import { BuildErrorType, PatchPlan, RuleContext } from "../types.js";

export class ModuleNotFoundRule extends BaseRule {
  constructor() {
    super("ModuleNotFoundRule", 100);
  }

  supports(error: { category: BuildErrorType }, context: RuleContext): boolean {
    void context;
    return error.category === BuildErrorType.MODULE_NOT_FOUND;
  }

  async createPatch(error: { file?: string; importSpecifier?: string }, context: RuleContext): Promise<PatchPlan | null> {
    if (!error.file || !error.importSpecifier) {
      return null;
    }

    const targetFile = context.importResolver.resolveImportTarget(error.file, error.importSpecifier, context.project);
    if (!targetFile) {
      return null;
    }

    const replacement = context.importResolver.resolveRelativeImport(error.file, targetFile);
    if (replacement === error.importSpecifier) {
      return null;
    }

    return {
      ruleName: this.name,
      summary: `Update import ${error.importSpecifier} in ${error.file}`,
      operations: [
        {
          kind: "update-import",
          file: error.file,
          currentValue: error.importSpecifier,
          nextValue: replacement
        }
      ]
    };
  }
}
