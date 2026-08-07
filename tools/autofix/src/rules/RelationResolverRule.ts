import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan } from "../types.js";

export default class RelationResolverRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["insert-property"],
      dependencies: [],
      description: "Resolve missing relation properties.",
      name: "RelationResolverRule",
      priority: 160,
      targets: [BuildErrorType.TYPE_ERROR, BuildErrorType.PRISMA],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return /relation|foreign key|missing property/i.test(error.raw);
  }

  async createPatch(error: BuildError): Promise<PatchPlan | null> {
    const targetName = this.inferContainerName(error.message);
    if (!error.file || !targetName) {
      return null;
    }

    return {
      ruleName: this.manifest.name,
      summary: `Insert relation property into ${targetName}`,
      operations: [
        {
          kind: "insert-property",
          file: error.file,
          targetName,
          propertyName: "relationId",
          propertyType: "string",
          optional: false
        }
      ]
    };
  }
}
