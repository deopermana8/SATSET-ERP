import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan, RuleContext } from "../types.js";

export class UpdatedAtRule extends BaseRule {
  constructor() {
    super("UpdatedAtRule", 80);
  }

  supports(error: BuildError): boolean {
    return error.category === BuildErrorType.TYPE_ERROR && /updatedAt/i.test(error.message);
  }

  async createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null> {
    void context;
    const filePath = this.pickPrimaryFile(error);
    const targetName = this.inferContainerName(error.message);
    if (!filePath || !targetName) {
      return null;
    }

    return {
      ruleName: this.name,
      summary: `Insert updatedAt property into ${targetName}`,
      operations: [
        {
          kind: "insert-property",
          file: filePath,
          targetName,
          propertyName: "updatedAt",
          propertyType: "Date",
          optional: false
        }
      ]
    };
  }
}
