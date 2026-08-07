import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan, RuleContext } from "../types.js";

interface PathModule {
  join(...paths: string[]): string;
}

const path = require("node:path") as PathModule;

export interface GeneratorHealthRuleConfig {
  advisory: string;
  category: BuildErrorType;
  code: string;
  description: string;
  name: string;
  pattern: RegExp;
  priority: number;
}

export abstract class GeneratorHealthRuleBase extends BaseRule {
  protected constructor(private readonly config: GeneratorHealthRuleConfig) {
    super({
      capabilities: ["write-file"],
      dependencies: [],
      description: config.description,
      name: config.name,
      priority: config.priority,
      targets: [config.category],
      version: "2.0.0"
    });
  }

  supports(error: BuildError): boolean {
    if (error.code === this.config.code) {
      return true;
    }

    return this.config.pattern.test(error.message) || this.config.pattern.test(error.raw);
  }

  async createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null> {
    if (!this.supports(error)) {
      return null;
    }

    const reportPath = path.join(context.project.toolsDir, "reports", `${this.config.name}.md`);
    const location = error.file ? `${error.file}${error.line ? `:${error.line}` : ""}` : "unknown";
    const content = [
      `# ${this.config.name}`,
      "",
      `Code: ${this.config.code}`,
      `Location: ${location}`,
      "",
      this.config.advisory,
      ""
    ].join("\n");

    return {
      ruleName: this.manifest.name,
      summary: `${this.config.name} advisory generated`,
      operations: [
        {
          kind: "write-file",
          file: reportPath,
          nextValue: content
        }
      ]
    };
  }
}
