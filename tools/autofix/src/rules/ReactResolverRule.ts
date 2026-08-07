import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan } from "../types.js";

export default class ReactResolverRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["update-type"],
      dependencies: ["TypeResolverRule"],
      description: "Resolve React event typing issues.",
      name: "ReactResolverRule",
      priority: 135,
      targets: [BuildErrorType.TYPE_ERROR],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return /React\.ChangeEvent|HTMLInputElement|currentTarget|event\.target/i.test(error.raw);
  }

  async createPatch(error: BuildError): Promise<PatchPlan | null> {
    if (!error.file) {
      return null;
    }

    return {
      ruleName: this.manifest.name,
      summary: "Update React input event type",
      operations: [
        {
          kind: "update-type",
          file: error.file,
          targetName: "event",
          nextValue: "React.ChangeEvent<HTMLInputElement>"
        }
      ]
    };
  }
}
