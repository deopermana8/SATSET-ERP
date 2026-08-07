import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan, RuleContext } from "../types.js";

export default class PrismaResolverRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["update-import"],
      dependencies: ["ImportResolverRule"],
      description: "Resolve Prisma generated client imports.",
      name: "PrismaResolverRule",
      priority: 190,
      targets: [BuildErrorType.PRISMA, BuildErrorType.MODULE_NOT_FOUND],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return error.category === BuildErrorType.PRISMA || /prisma/i.test(error.importSpecifier ?? "");
  }

  async createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null> {
    if (!error.file || !error.importSpecifier) {
      return null;
    }

    const generatedPath = context.project.generatedPrismaPaths[0];
    if (!generatedPath) {
      return null;
    }

    return {
      ruleName: this.manifest.name,
      summary: "Resolve Prisma client import",
      operations: [
        {
          kind: "update-import",
          file: error.file,
          currentValue: error.importSpecifier,
          nextValue: context.importResolver.resolveRelativeImport(error.file, generatedPath)
        }
      ]
    };
  }
}
