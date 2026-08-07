import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan, RuleContext } from "../types.js";

export class ReactTypeRule extends BaseRule {
  constructor() {
    super("ReactTypeRule", 60);
  }

  supports(error: BuildError): boolean {
    return error.category === BuildErrorType.TYPE_ERROR && /(React\.ChangeEvent|HTMLInputElement|currentTarget|event\.target)/i.test(error.raw);
  }

  async createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null> {
    void context;
    const filePath = this.pickPrimaryFile(error);
    if (!filePath) {
      return null;
    }

    return {
      ruleName: this.name,
      summary: `Update event typing in ${filePath}`,
      operations: [
        {
          kind: "update-type",
          file: filePath,
          targetName: "event",
          nextValue: "React.ChangeEvent<HTMLInputElement>"
        }
      ]
    };
  }
}
