import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";

export interface PatchSummary {
  applied: number;
  changes: Array<{ filePath: string; status: "applied" | "skipped"; reason?: string }>;
}

export class PatchGeneratorEngine implements IEngine {
  public readonly name = "PatchGeneratorEngine";

  async run(context: Context): Promise<void> {
    const decision = (context.metadata as Record<string, unknown>).repairDecision as {
      changes?: Array<{ filePath: string; oldText?: string; newText?: string }>;
    } | undefined;
    const changes = decision?.changes ?? [];
    const summary: PatchSummary = { applied: 0, changes: [] };

    for (const change of changes) {
      const fullPath = change.filePath;
      const current = await fs.readFile(fullPath, "utf8").catch(() => "");
      if (change.oldText && current.includes(change.oldText) && change.newText) {
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, current.replace(change.oldText, change.newText), "utf8");
        summary.applied += 1;
        summary.changes.push({ filePath: fullPath, status: "applied", reason: "patched" });
      } else {
        summary.changes.push({ filePath: fullPath, status: "skipped", reason: "no matching content" });
      }
    }

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "patch-summary",
      name: "patch-summary",
      templatePath: path.join(context.projectRoot, "templates", "patch-summary.md.tpl"),
      outputPath: path.join(context.projectRoot, "patch-summary.md"),
      variables: {
        applied: String(summary.applied),
        count: String(changes.length),
      },
    }]);

    context.metadata = {
      ...context.metadata,
      patchSummary: summary,
    } as typeof context.metadata & { patchSummary?: PatchSummary };
  }
}
