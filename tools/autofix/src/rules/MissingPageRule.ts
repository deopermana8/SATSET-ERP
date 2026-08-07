import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class MissingPageRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Regenerate list/detail/create/edit pages via PageGenerator.",
      category: BuildErrorType.MODULE_NOT_FOUND,
      code: "SATSET_MISSING_PAGE",
      description: "Detect missing generated page files.",
      name: "MissingPageRule",
      pattern: /page|screen|view/i,
      priority: 370
    });
  }
}
