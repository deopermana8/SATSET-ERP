import { BuildErrorType } from "../types.js";
import { GeneratorHealthRuleBase } from "./GeneratorHealthRuleBase.js";

export default class BrokenGeneratorRegistrationRule extends GeneratorHealthRuleBase {
  constructor() {
    super({
      advisory: "Restore plugin file naming (*Plugin.ts) and manifest registration metadata.",
      category: BuildErrorType.UNKNOWN,
      code: "SATSET_BROKEN_GENERATOR_REGISTRATION",
      description: "Detect broken generator plugin registration wiring.",
      name: "BrokenGeneratorRegistrationRule",
      pattern: /plugin dependency not found|discovered plugin|registration/i,
      priority: 340
    });
  }
}
