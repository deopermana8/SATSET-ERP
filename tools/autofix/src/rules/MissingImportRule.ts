import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class MissingImportRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Resolve import via resolver and re-export from module barrel.",
      category: BuildErrorType.MODULE_NOT_FOUND,
      code: "SATSET_MISSING_IMPORT",
      description: "Detect missing import in generated modules.",
      name: "MissingImportRule",
      pattern: /cannot find module|module not found|missing import/i,
      priority: 480
    });
  }
}
