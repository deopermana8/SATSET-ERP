import type { Context } from "../core/Context.js";
import type { Issue } from "../core/Issue.js";
import type { IEngine } from "../core/IEngine.js";
import type { IRule } from "./IRule.js";

export class RuleEngine implements IEngine {
  public readonly name = "RuleEngine";
  private readonly rules: IRule[] = [];

  register(rule: IRule): void {
    this.rules.push(rule);
  }

  getRules(): IRule[] {
    return [...this.rules];
  }

  async run(context: Context): Promise<void> {
    for (const rule of this.rules) {
      if (!rule.match(context)) {
        continue;
      }

      const beforeIssuesLength = context.getIssues().length;
      const result = rule.analyze(context) as Issue | Issue[] | void;

      if (result) {
        if (Array.isArray(result)) {
          for (const issue of result) {
            context.addIssue(issue);
          }
        } else {
          context.addIssue(result);
        }
      }

      const afterIssues = context.getIssues();
      for (let i = beforeIssuesLength; i < afterIssues.length; i += 1) {
        context.addIssue(afterIssues[i]);
      }
    }
  }
}
