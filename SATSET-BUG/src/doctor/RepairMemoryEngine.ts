import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";

export interface RepairMemoryEntry {
  id: string;
  category: string;
  severity: string;
  errors: string[];
  solution: string;
}

export interface RepairMemoryState {
  reused: boolean;
  entries: RepairMemoryEntry[];
}

export class RepairMemoryEngine implements IEngine {
  public readonly name = "RepairMemoryEngine";

  async run(context: Context): Promise<void> {
    const memoryPath = path.join(context.projectRoot, ".repair-memory.json");
    const failureReport = (context.metadata as Record<string, unknown>).failureReport as {
      category?: string;
      severity?: string;
      errors?: string[];
    } | undefined;

    const category = failureReport?.category ?? "typescript";
    const severity = failureReport?.severity ?? "medium";
    const errors = failureReport?.errors ?? [];
    const id = `repair:${category}:${errors.join("|")}`.slice(0, 180);

    let entries: RepairMemoryEntry[] = [];
    try {
      const existing = await fs.readFile(memoryPath, "utf8");
      entries = JSON.parse(existing) as RepairMemoryEntry[];
    } catch {
      entries = [];
    }

    const existingEntry = entries.find((entry) => entry.id === id);
    const reused = Boolean(existingEntry);
    if (!existingEntry) {
      entries.push({
        id,
        category,
        severity,
        errors,
        solution: `repair ${category} issue with minimal patch`,
      });
    }

    await fs.writeFile(memoryPath, JSON.stringify(entries, null, 2), "utf8");

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "repair-memory",
      name: "repair-memory",
      templatePath: path.join(context.projectRoot, "templates", "repair-plan.md.tpl"),
      outputPath: path.join(context.projectRoot, "knowledge", "repair-memory.json"),
      variables: {
        strategy: reused ? "reuse" : "remember",
        priority: severity === "high" ? "high" : "medium",
        category,
      },
    }]);

    context.metadata = {
      ...context.metadata,
      repairMemory: {
        reused,
        entries,
      },
    } as typeof context.metadata & { repairMemory?: RepairMemoryState };
  }
}
