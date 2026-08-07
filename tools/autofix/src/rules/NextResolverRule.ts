import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan } from "../types.js";

export default class NextResolverRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["update-json", "rename-identifier"],
      dependencies: ["RouteResolverRule"],
      description: "Resolve Next.js build constraints.",
      name: "NextResolverRule",
      priority: 130,
      targets: [BuildErrorType.NEXT],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return error.category === BuildErrorType.NEXT;
  }

  async createPatch(error: BuildError): Promise<PatchPlan | null> {
    if (!error.file) {
      return null;
    }

    return {
      ruleName: this.manifest.name,
      summary: "Normalize Next.js route export",
      operations: [
        {
          kind: "rename-identifier",
          file: error.file,
          targetName: "GET",
          nextValue: "handleGet"
        }
      ]
    };
  }
}
