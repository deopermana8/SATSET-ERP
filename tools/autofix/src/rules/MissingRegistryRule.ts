import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class MissingRegistryRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Register plugin/rule in registry and verify discovery naming convention.",
      category: BuildErrorType.UNKNOWN,
      code: "SATSET_MISSING_REGISTRY",
      description: "Detect missing plugin or rule registry entries.",
      name: "MissingRegistryRule",
      pattern: /registry|discover|not registered/i,
      priority: 390
    });
  }
}
