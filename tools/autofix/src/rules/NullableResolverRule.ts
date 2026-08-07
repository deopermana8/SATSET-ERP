import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan } from "../types.js";

export default class NullableResolverRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["insert-property", "update-type"],
      dependencies: ["TypeResolverRule"],
      description: "Resolve nullability mismatches.",
      name: "NullableResolverRule",
      priority: 170,
      targets: [BuildErrorType.TYPE_ERROR],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return error.category === BuildErrorType.TYPE_ERROR && /null|undefined|optional|possibly/i.test(error.raw);
  }

  async createPatch(error: BuildError): Promise<PatchPlan | null> {
    const targetName = this.inferContainerName(error.message);
    if (!error.file || !targetName) {
      return null;
    }

    return {
      ruleName: this.manifest.name,
      summary: `Mark property optional in ${targetName}`,
      operations: [
        {
          kind: "insert-property",
          file: error.file,
          targetName,
          propertyName: "updatedAt",
          propertyType: "Date | null",
          optional: true
        }
      ]
    };
  }
}
