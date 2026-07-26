import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { CommandExecutor } from "../commands/CommandExecutor.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";

export interface PatchValidation {
  valid: boolean;
  checked: number;
  errors: string[];
}

export class PatchValidatorEngine implements IEngine {
  public readonly name = "PatchValidatorEngine";

  constructor(private readonly executor = new CommandExecutor()) {}

  async run(context: Context): Promise<void> {
    const patchSummary = (context.metadata as Record<string, unknown>).patchSummary as { changes?: Array<{ filePath: string }> } | undefined;
    const changes = patchSummary?.changes ?? [];
    const errors: string[] = [];

    for (const change of changes) {
      const filePath = change.filePath;
      try {
        const content = await fs.readFile(filePath, "utf8");
        if (!content.trim()) {
          errors.push(`empty:${filePath}`);
        }
      } catch {
        errors.push(`missing:${filePath}`);
      }
    }

    const changedFiles = changes.map((change) => change.filePath).filter(Boolean);
    if (changedFiles.length > 0) {
      const compileTargets = changedFiles.filter((filePath) => filePath.endsWith(".ts") || filePath.endsWith(".tsx") || filePath.endsWith(".js") || filePath.endsWith(".jsx"));
      if (compileTargets.length > 0) {
        const result = await this.executor.pnpm(["exec", "tsc", "--noEmit", "--pretty", "false", ...compileTargets], context.projectRoot);
        if (result.exitCode !== 0) {
          errors.push(...result.stderr.split(/\n+/).filter(Boolean).slice(0, 5));
        }
      }
    }

    const validation: PatchValidation = {
      valid: errors.length === 0,
      checked: changes.length,
      errors,
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "failure-report",
      name: "failure-report",
      templatePath: path.join(context.projectRoot, "templates", "failure-report.json.tpl"),
      outputPath: path.join(context.projectRoot, "failure-report.json"),
      variables: {
        category: "typescript",
        valid: String(validation.valid),
      },
    }]);

    context.metadata = {
      ...context.metadata,
      patchValidation: validation,
    } as typeof context.metadata & { patchValidation?: PatchValidation };
  }
}
