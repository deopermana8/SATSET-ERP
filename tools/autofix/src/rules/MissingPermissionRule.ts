import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class MissingPermissionRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Regenerate permission contract via PermissionGenerator.",
      category: BuildErrorType.MODULE_NOT_FOUND,
      code: "SATSET_MISSING_PERMISSION",
      description: "Detect missing permission constants/guards.",
      name: "MissingPermissionRule",
      pattern: /permission|guard|rbac/i,
      priority: 430
    });
  }
}
