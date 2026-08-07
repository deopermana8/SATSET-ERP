import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class MissingValidatorRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Regenerate validation helper via ValidationGenerator.",
      category: BuildErrorType.MODULE_NOT_FOUND,
      code: "SATSET_MISSING_VALIDATOR",
      description: "Detect missing validator usage.",
      name: "MissingValidatorRule",
      pattern: /validate|validator/i,
      priority: 420
    });
  }
}
