import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan, RuleContext } from "../types.js";

export class PrismaImportRule extends BaseRule {
  constructor() {
    super("PrismaImportRule", 90);
  }

  supports(error: BuildError): boolean {
    if (error.category === BuildErrorType.PRISMA) {
      return true;
    }

    return error.category === BuildErrorType.MODULE_NOT_FOUND && typeof error.importSpecifier === "string" && /prisma/i.test(error.importSpecifier);
  }

  async createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null> {
    if (!error.file || !error.importSpecifier) {
      return null;
    }

    const generatedClientFile = this.findGeneratedClientFile(context);
    if (!generatedClientFile) {
      return null;
    }

    const replacement = context.importResolver.resolveRelativeImport(error.file, generatedClientFile);
    if (replacement === error.importSpecifier) {
      return null;
    }

    return {
      ruleName: this.name,
      summary: `Redirect Prisma import in ${error.file}`,
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

  private findGeneratedClientFile(context: RuleContext): string | undefined {
    const candidates = context.project.importableFiles.filter((filePath) => {
      const normalizedPath = filePath.replace(/\\/g, "/");
      return /(generated\/(prisma|client)|\.prisma\/client)\/(index\.(ts|js|d\.ts)|client\.(ts|js|d\.ts))$/i.test(normalizedPath);
    });

    return candidates[0];
  }
}
