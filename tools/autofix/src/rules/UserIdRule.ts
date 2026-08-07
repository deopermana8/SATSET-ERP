import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan, RuleContext } from "../types.js";

export class UserIdRule extends BaseRule {
  constructor() {
    super("UserIdRule", 70);
  }

  supports(error: BuildError): boolean {
    return error.category === BuildErrorType.TYPE_ERROR && /userId/i.test(error.message);
  }

  async createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null> {
    void context;
    const filePath = this.pickPrimaryFile(error);
    if (!filePath) {
      return null;
    }

    const targetName = this.inferContainerName(error.message);
    if (targetName) {
      return {
        ruleName: this.name,
        summary: `Update userId type in ${targetName}`,
        operations: [
          {
            kind: "update-type",
            file: filePath,
            targetName,
            propertyName: "userId",
            nextValue: "string"
          }
        ]
      };
    }

    return {
      ruleName: this.name,
      summary: `Rename userId declarations in ${filePath}`,
      operations: [
        {
          kind: "update-type",
          file: filePath,
          targetName: "userId",
          nextValue: "string"
        }
      ]
    };
  }
}
