import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class WrongAliasImportRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Fix alias import path mapping and tsconfig path configuration.",
      category: BuildErrorType.MODULE_NOT_FOUND,
      code: "SATSET_WRONG_ALIAS_IMPORT",
      description: "Detect incorrect alias import mapping.",
      name: "WrongAliasImportRule",
      pattern: /alias|paths|@\//i,
      priority: 350
    });
  }
}
