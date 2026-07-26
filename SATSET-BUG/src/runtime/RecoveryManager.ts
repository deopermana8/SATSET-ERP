import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";

export interface RecoveryCheckpoint {
  stage: string;
  completed: string[];
  timestamp: string;
}

export class RecoveryManager {
  constructor(private readonly checkpointPath = "knowledge/checkpoint.json") {}

  async save(context: Context, completed: string[]): Promise<void> {
    const checkpoint: RecoveryCheckpoint = { stage: "runtime", completed, timestamp: new Date().toISOString() };
    await fs.mkdir(path.dirname(path.join(context.projectRoot, this.checkpointPath)), { recursive: true });
    await fs.writeFile(path.join(context.projectRoot, this.checkpointPath), JSON.stringify(checkpoint, null, 2), "utf8");
  }

  async load(context: Context): Promise<RecoveryCheckpoint | null> {
    try {
      const file = await fs.readFile(path.join(context.projectRoot, this.checkpointPath), "utf8");
      return JSON.parse(file) as RecoveryCheckpoint;
    } catch {
      return null;
    }
  }

  async resume(context: Context, engines: string[]): Promise<string[]> {
    const checkpoint = await this.load(context);
    const completed = checkpoint?.completed ?? [];
    return engines.filter((engine) => !completed.includes(engine));
  }
}
