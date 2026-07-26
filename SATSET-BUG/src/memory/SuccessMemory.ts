import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";

export class SuccessMemory {
  async remember(context: Context, summary: string): Promise<void> {
    const knowledgePath = path.join(context.projectRoot, "knowledge");
    await fs.mkdir(knowledgePath, { recursive: true });
    await fs.writeFile(path.join(knowledgePath, "success-memory.json"), JSON.stringify({ successes: [{ summary }] }, null, 2), "utf8");
  }
}
