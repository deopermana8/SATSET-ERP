import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";

export interface MemoryEntry {
  id: string;
  kind: string;
  summary: string;
  source: string;
}

export class MemoryIndexer {
  async index(context: Context, entries: MemoryEntry[]): Promise<void> {
    const knowledgePath = path.join(context.projectRoot, "knowledge");
    await fs.mkdir(knowledgePath, { recursive: true });
    await fs.writeFile(path.join(knowledgePath, "memory-index.json"), JSON.stringify({ entries }, null, 2), "utf8");
  }
}
