import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class MissingExportRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Export generated symbol from barrel/index file.",
      category: BuildErrorType.TYPE_ERROR,
      code: "SATSET_MISSING_EXPORT",
      description: "Detect missing export from generated module.",
      name: "MissingExportRule",
      pattern: /has no exported member|is not exported/i,
      priority: 400
    });
  }
}
