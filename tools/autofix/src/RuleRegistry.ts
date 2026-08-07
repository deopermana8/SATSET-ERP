import { Rule, RuleRegistryReport } from "./types.js";

interface PathModule {
  basename(filePath: string): string;
  join(...paths: string[]): string;
}

interface FastGlobFunction {
  (patterns: readonly string[] | string, options: {
    absolute: boolean;
    cwd: string;
    dot: boolean;
    ignore: string[];
    onlyFiles: boolean;
    suppressErrors: boolean;
    unique: boolean;
  }): Promise<string[]>;
}

const path = require("node:path") as PathModule;

export interface IRuleRegistry {
  discover(rulesRoot: string): Promise<Rule[]>;
  report(rules: readonly Rule[]): RuleRegistryReport;
}

export class RuleRegistry implements IRuleRegistry {
  private readonly cache = new Map<string, Rule[]>();

  async discover(rulesRoot: string): Promise<Rule[]> {
    const cached = this.cache.get(rulesRoot);
    if (cached) {
      return cached;
    }

    const fastGlob = require("fast-glob") as FastGlobFunction;
    const ruleFiles = await fastGlob(["**/*Rule.{js,ts}"], {
      absolute: true,
      cwd: rulesRoot,
      dot: false,
      ignore: [
        "**/BaseRule.*",
        "**/Index.*",
        "**/ModuleNotFoundRule.*",
        "**/PrismaImportRule.*",
        "**/ReactTypeRule.*",
        "**/TsConfigRule.*",
        "**/UpdatedAtRule.*",
        "**/UserIdRule.*"
      ],
      onlyFiles: true,
      suppressErrors: true,
      unique: true
    });
    const rules: Rule[] = [];

    for (const ruleFile of ruleFiles.sort()) {
      if (path.basename(ruleFile).startsWith("Base")) {
        continue;
      }

      const moduleValue = require(ruleFile) as { default?: new () => Rule; [key: string]: unknown };
      const ruleClass = this.resolveRuleClass(moduleValue);
      if (!ruleClass) {
        continue;
      }

      rules.push(new ruleClass());
    }

    this.cache.set(rulesRoot, rules);
    return rules;
  }

  report(rules: readonly Rule[]): RuleRegistryReport {
    return {
      count: rules.length,
      names: rules.map((rule) => rule.manifest.name)
    };
  }

  private resolveRuleClass(moduleValue: { default?: new () => Rule; [key: string]: unknown }): (new () => Rule) | undefined {
    if (moduleValue.default) {
      return moduleValue.default;
    }

    for (const key of Object.keys(moduleValue)) {
      const candidate = moduleValue[key];
      if (typeof candidate === "function") {
        return candidate as new () => Rule;
      }
    }

    return undefined;
  }
}
