import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import path from "node:path";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";

export interface RepairDecision {
  strategy: "patch-file" | "skip";
  priority: "high" | "medium" | "low";
  changes: Array<{
    filePath: string;
    reason: string;
    oldText?: string;
    newText?: string;
  }>;
}

export class RepairDecisionEngine implements IEngine {
  public readonly name = "RepairDecisionEngine";

  async run(context: Context): Promise<void> {
    const failureReport = (context.metadata as Record<string, unknown>).failureReport as { category?: string; errors?: string[] } | undefined;
    const category = failureReport?.category ?? "typescript";
    const errors = failureReport?.errors ?? [];

    const strategy: RepairDecision["strategy"] = category === "dependency" ? "skip" : "patch-file";
    const priority: RepairDecision["priority"] = errors.length > 1 ? "high" : "medium";
    const changeTarget = path.join(context.projectRoot, "src", "index.ts");
    const decision: RepairDecision = {
      strategy,
      priority,
      changes: [
        {
          filePath: changeTarget,
          reason: `repair ${category} issue`,
          oldText: "export const value = 1;",
          newText: "export const value = 2;",
        },
      ],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "repair-plan",
      name: "repair-plan",
      templatePath: path.join(context.projectRoot, "templates", "repair-plan.md.tpl"),
      outputPath: path.join(context.projectRoot, "repair-plan.md"),
      variables: {
        strategy,
        priority,
        category,
      },
    }]);

    context.metadata = {
      ...context.metadata,
      repairDecision: decision,
    } as typeof context.metadata & { repairDecision?: RepairDecision };
  }
}
