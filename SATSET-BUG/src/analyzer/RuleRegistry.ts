import type { RuleEngine } from "./RuleEngine.js";
import { PrismaIntegrityRule } from "./rules/PrismaIntegrityRule.js";
import { TypeScriptConfigurationRule } from "./rules/TypeScriptConfigurationRule.js";
import { NextJsConfigurationRule } from "./rules/NextJsConfigurationRule.js";
import { TurboConfigurationRule } from "./rules/TurboConfigurationRule.js";
import { DependencyConflictRule } from "./rules/DependencyConflictRule.js";

export class RuleRegistry {
  registerDefaults(engine: RuleEngine): void {
    engine.register(new PrismaIntegrityRule());
    engine.register(new TypeScriptConfigurationRule());
    engine.register(new NextJsConfigurationRule());
    engine.register(new TurboConfigurationRule());
    engine.register(new DependencyConflictRule());
  }
}
