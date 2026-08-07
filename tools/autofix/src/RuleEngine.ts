import { BuildError, PatchPlan, Rule, RuleContext } from "./types.js";

export interface IRuleEngine {
  register(rule: Rule): void;
  registerMany(rules: readonly Rule[]): void;
  dispatch(errors: readonly BuildError[], context: RuleContext): Promise<PatchPlan | null>;
  list(): readonly Rule[];
}

export class RuleEngine implements IRuleEngine {
  private readonly rules = new Map<string, Rule>();

  register(rule: Rule): void {
    if (this.rules.has(rule.manifest.name)) {
      throw new Error(`Rule already registered: ${rule.manifest.name}`);
    }

    this.rules.set(rule.manifest.name, rule);
  }

  registerMany(rules: readonly Rule[]): void {
    for (const rule of rules) {
      this.register(rule);
    }
  }

  async dispatch(errors: readonly BuildError[], context: RuleContext): Promise<PatchPlan | null> {
    const orderedRules = Array.from(this.rules.values()).sort((left, right) => right.manifest.priority - left.manifest.priority);

    for (const error of errors) {
      for (const rule of orderedRules) {
        const supported = await rule.supports(error, context);
        if (!supported) {
          continue;
        }

        const patchPlan = await rule.createPatch(error, context);
        if (patchPlan) {
          return patchPlan;
        }
      }
    }

    return null;
  }

  list(): readonly Rule[] {
    return Array.from(this.rules.values());
  }
}
