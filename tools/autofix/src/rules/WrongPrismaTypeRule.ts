import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class WrongPrismaTypeRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Regenerate prisma schema from CrudGenerator and re-run migration generator.",
      category: BuildErrorType.TYPE_ERROR,
      code: "SATSET_WRONG_PRISMA_TYPE",
      description: "Detect wrong prisma scalar/type mapping.",
      name: "WrongPrismaTypeRule",
      pattern: /prisma.*type|unknown arg|invalid prisma/i,
      priority: 470
    });
  }
}
