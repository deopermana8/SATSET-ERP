import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan } from "../types.js";

export default class TypeResolverRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["update-type"],
      dependencies: [],
      description: "Update incompatible type declarations.",
      name: "TypeResolverRule",
      priority: 180,
      targets: [BuildErrorType.TYPE_ERROR],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return error.category === BuildErrorType.TYPE_ERROR && /not assignable|Type error|expected/i.test(error.message);
  }

  async createPatch(error: BuildError): Promise<PatchPlan | null> {
    const targetName = this.inferContainerName(error.message);
    if (!error.file || !targetName) {
      return null;
    }

    return {
      ruleName: this.manifest.name,
      summary: `Update type in ${targetName}`,
      operations: [
        {
          kind: "update-type",
          file: error.file,
          targetName,
          nextValue: "string"
        }
      ]
    };
  }
}
