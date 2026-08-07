import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class WrongRouteRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Regenerate API route using ApiRouteGenerator and update route registry.",
      category: BuildErrorType.TYPE_ERROR,
      code: "SATSET_WRONG_ROUTE",
      description: "Detect wrong CRUD route signatures.",
      name: "WrongRouteRule",
      pattern: /route|router|endpoint|handler/i,
      priority: 460
    });
  }
}
