import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class MissingDependencyRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Complete dependency chain from CrudGenerator to DocumentationGenerator.",
      category: BuildErrorType.UNKNOWN,
      code: "SATSET_MISSING_DEPENDENCY",
      description: "Detect missing plugin dependency declaration.",
      name: "MissingDependencyRule",
      pattern: /dependency|cyclic plugin dependency|not found/i,
      priority: 380
    });
  }
}
