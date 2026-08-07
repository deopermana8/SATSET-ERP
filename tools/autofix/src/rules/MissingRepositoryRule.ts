import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class MissingRepositoryRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Generate repository contract via RepositoryGenerator and wire to service.",
      category: BuildErrorType.MODULE_NOT_FOUND,
      code: "SATSET_MISSING_REPOSITORY",
      description: "Detect missing repository implementation references.",
      name: "MissingRepositoryRule",
      pattern: /repository/i,
      priority: 450
    });
  }
}
