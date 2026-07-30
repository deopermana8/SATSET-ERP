import type { RuleEngine } from "./RuleEngine.js";
import { PrismaIntegrityRule } from "./rules/PrismaIntegrityRule.js";
import { TypeScriptConfigurationRule } from "./rules/TypeScriptConfigurationRule.js";
import { NextJsConfigurationRule } from "./rules/NextJsConfigurationRule.js";
import { TurboConfigurationRule } from "./rules/TurboConfigurationRule.js";
import { DependencyConflictRule } from "./rules/DependencyConflictRule.js";
import { PluginManager } from "../plugins/PluginManager.js";
import type { IPlugin } from "../plugins/IPlugin.js";

class RulePlugin implements IPlugin {
  constructor(
    public readonly id: string,
    public readonly name: string,
    private readonly registerRule: () => void
  ) {}

  register(): void {
    this.registerRule();
  }
}

export class RuleRegistry {
  registerDefaults(engine: RuleEngine): void {
    const pluginManager = new PluginManager();

    pluginManager.register(
      new RulePlugin("prisma-rules", "Prisma Rules", () => {
        engine.register(new PrismaIntegrityRule());
      })
    );

    pluginManager.register(
      new RulePlugin("typescript-rules", "TypeScript Rules", () => {
        engine.register(new TypeScriptConfigurationRule());
      })
    );

    pluginManager.register(
      new RulePlugin("next-rules", "Next Rules", () => {
        engine.register(new NextJsConfigurationRule());
      })
    );

    pluginManager.register(
      new RulePlugin("turbo-rules", "Turbo Rules", () => {
        engine.register(new TurboConfigurationRule());
      })
    );

    pluginManager.register(
      new RulePlugin("dependency-rules", "Dependency Rules", () => {
        engine.register(new DependencyConflictRule());
      })
    );

    pluginManager.registerAll();
  }
}
