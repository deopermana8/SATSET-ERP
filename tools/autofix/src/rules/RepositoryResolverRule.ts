import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan } from "../types.js";

export default class RepositoryResolverRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["insert-property", "update-type"],
      dependencies: [],
      description: "Resolve repository contract mismatches.",
      name: "RepositoryResolverRule",
      priority: 120,
      targets: [BuildErrorType.TYPE_ERROR, BuildErrorType.MODULE_NOT_FOUND],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return /repository|service/i.test(error.raw);
  }

  async createPatch(error: BuildError): Promise<PatchPlan | null> {
    const targetName = this.inferContainerName(error.message);
    if (!error.file || !targetName) {
      return null;
    }

    return {
      ruleName: this.manifest.name,
      summary: `Normalize repository contract for ${targetName}`,
      operations: [
        {
          kind: "insert-property",
          file: error.file,
          targetName,
          propertyName: "repository",
          propertyType: "string",
          optional: true
        }
      ]
    };
  }
}
