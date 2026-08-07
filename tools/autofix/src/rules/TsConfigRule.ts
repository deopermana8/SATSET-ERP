import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan, RuleContext } from "../types.js";

export class TsConfigRule extends BaseRule {
  constructor() {
    super("TsConfigRule", 50);
  }

  supports(error: BuildError): boolean {
    return error.category === BuildErrorType.TYPE_ERROR && /type definition file|moduleResolution|module nodenext/i.test(error.message);
  }

  async createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null> {
    const tsconfigPath = this.pickClosestTsConfig(error.file, context);
    if (!tsconfigPath) {
      return null;
    }

    if (/Cannot find type definition file for ['"`]node['"`]/i.test(error.message)) {
      return {
        ruleName: this.name,
        summary: `Remove unsupported node type entry from ${tsconfigPath}`,
        operations: [
          {
            kind: "update-json",
            file: tsconfigPath,
            jsonPath: ["compilerOptions", "types"],
            nextValue: []
          }
        ]
      };
    }

    return {
      ruleName: this.name,
      summary: `Set moduleResolution to NodeNext in ${tsconfigPath}`,
      operations: [
        {
          kind: "update-json",
          file: tsconfigPath,
          jsonPath: ["compilerOptions", "moduleResolution"],
          nextValue: "NodeNext"
        }
      ]
    };
  }

  private pickClosestTsConfig(filePath: string | undefined, context: RuleContext): string | undefined {
    if (!filePath) {
      return context.project.tsconfigFiles[0];
    }

    const normalizedFilePath = filePath.replace(/\\/g, "/");
    let bestMatch: string | undefined;
    let bestScore = -1;

    for (const tsconfigPath of context.project.tsconfigFiles) {
      const normalizedTsConfig = tsconfigPath.replace(/\\/g, "/");
      let score = 0;
      for (let index = 0; index < Math.min(normalizedFilePath.length, normalizedTsConfig.length); index += 1) {
        if (normalizedFilePath[index] !== normalizedTsConfig[index]) {
          break;
        }
        score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = tsconfigPath;
      }
    }

    return bestMatch;
  }
}
