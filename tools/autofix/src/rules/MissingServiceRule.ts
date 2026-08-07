import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class MissingServiceRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Generate service layer via ServiceGenerator and update API dependencies.",
      category: BuildErrorType.MODULE_NOT_FOUND,
      code: "SATSET_MISSING_SERVICE",
      description: "Detect missing service references.",
      name: "MissingServiceRule",
      pattern: /service/i,
      priority: 440
    });
  }
}
