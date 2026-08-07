import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class MissingHookRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Regenerate UI data hook via HookGenerator.",
      category: BuildErrorType.MODULE_NOT_FOUND,
      code: "SATSET_MISSING_HOOK",
      description: "Detect missing generated hooks.",
      name: "MissingHookRule",
      pattern: /use[A-Z].*|hook/i,
      priority: 410
    });
  }
}
