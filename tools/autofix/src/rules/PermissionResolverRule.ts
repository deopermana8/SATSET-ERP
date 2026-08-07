import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan } from "../types.js";

export default class PermissionResolverRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["insert-property"],
      dependencies: [],
      description: "Resolve permission contract gaps.",
      name: "PermissionResolverRule",
      priority: 125,
      targets: [BuildErrorType.TYPE_ERROR],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return /permission|role|scope/i.test(error.raw);
  }

  async createPatch(error: BuildError): Promise<PatchPlan | null> {
    const targetName = this.inferContainerName(error.message);
    if (!error.file || !targetName) {
      return null;
    }

    return {
      ruleName: this.manifest.name,
      summary: `Insert permission field into ${targetName}`,
      operations: [
        {
          kind: "insert-property",
          file: error.file,
          targetName,
          propertyName: "permissionKey",
          propertyType: "string",
          optional: false
        }
      ]
    };
  }
}
