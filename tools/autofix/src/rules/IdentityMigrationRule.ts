import { BaseRule } from "./BaseRule.js";
import { BuildError, BuildErrorType, PatchPlan, RuleContext } from "../types.js";

interface PathModule {
  join(...paths: string[]): string;
}

const path = require("node:path") as PathModule;

export default class IdentityMigrationRule extends BaseRule {
  constructor() {
    super({
      capabilities: ["write-file"],
      dependencies: [],
      description: "Detect manual auth/session/permission implementation and suggest migration to IdentityGenerator.",
      name: "IdentityMigrationRule",
      priority: 500,
      targets: [BuildErrorType.IDENTITY_MANUAL],
      version: "1.0.0"
    });
  }

  supports(error: BuildError): boolean {
    return error.code === "SATSET_IDENTITY_MANUAL" || /identity-manual-detected/i.test(error.message);
  }

  async createPatch(error: BuildError, context: RuleContext): Promise<PatchPlan | null> {
    const findings = context.diagnostics.filter((diagnostic) => diagnostic.code === "SATSET_IDENTITY_MANUAL");
    if (findings.length === 0) {
      return null;
    }

    const reportPath = path.join(context.project.toolsDir, "reports", "identity-migration-report.md");
    const lines: string[] = [
      "# Identity Migration Advisory",
      "",
      "Manual auth/password/session/permission logic detected.",
      "Migrate these areas to IdentityGenerator outputs.",
      "",
      "## Findings"
    ];

    for (const finding of findings) {
      const location = finding.file ? `${finding.file}${finding.line ? `:${finding.line}` : ""}` : "unknown";
      lines.push(`- ${location} :: ${finding.message}`);
    }

    lines.push("", "## Migration Steps", "- Generate identity foundation via IdentityGenerator.", "- Replace manual route handlers with identity API/controller layer.", "- Replace manual hashing/JWT/session code with identity services.", "- Replace manual permission checks with identity permission guard.", "");

    return {
      ruleName: this.manifest.name,
      summary: `Identity migration advice generated (${findings.length} findings)`,
      operations: [
        {
          kind: "write-file",
          file: reportPath,
          nextValue: `${lines.join("\n")}\n`
        }
      ]
    };
  }
}
