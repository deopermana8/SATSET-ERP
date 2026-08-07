import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class WrongRelativeImportRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Recalculate relative import using import resolver.",
      category: BuildErrorType.MODULE_NOT_FOUND,
      code: "SATSET_WRONG_RELATIVE_IMPORT",
      description: "Detect incorrect relative import in generated files.",
      name: "WrongRelativeImportRule",
      pattern: /\.\.|\.\/|relative import/i,
      priority: 360
    });
  }
}
