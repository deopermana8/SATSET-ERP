import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";

export interface ArchitecturePattern {
  id: string;
  name: string;
  summary: string;
}

export class ArchitectureKnowledge {
  async learn(context: Context, patterns: ArchitecturePattern[]): Promise<void> {
    const knowledgePath = path.join(context.projectRoot, "knowledge");
    await fs.mkdir(knowledgePath, { recursive: true });
    await fs.writeFile(path.join(knowledgePath, "architecture-history.json"), JSON.stringify({ patterns }, null, 2), "utf8");
  }
}
