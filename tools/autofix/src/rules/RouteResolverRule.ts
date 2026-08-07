import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan } from "../types.js";

export default class RouteResolverRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["update-import", "rename-identifier"],
      dependencies: [],
      description: "Resolve broken route imports and identifiers.",
      name: "RouteResolverRule",
      priority: 140,
      targets: [BuildErrorType.NEXT, BuildErrorType.MODULE_NOT_FOUND],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return /route|page|layout|segment/i.test(error.raw);
  }

  async createPatch(error: BuildError): Promise<PatchPlan | null> {
    if (!error.file || !error.importSpecifier) {
      return null;
    }

    return {
      ruleName: this.manifest.name,
      summary: `Normalize route import ${error.importSpecifier}`,
      operations: [
        {
          kind: "rename-identifier",
          file: error.file,
          targetName: "handler",
          nextValue: "routeHandler"
        }
      ]
    };
  }
}
