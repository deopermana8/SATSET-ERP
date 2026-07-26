import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { RuntimeEvent } from "./FactoryRuntime.js";

export interface CheckpointSnapshot {
  projectName: string;
  metadata: unknown;
  issues: readonly unknown[];
  recommendations: string[];
  repairLog: unknown[];
  repairLoop: unknown;
  repairSummary: unknown;
  health: unknown;
  verification: unknown;
  events: RuntimeEvent[];
  stage?: string;
}

export class CheckpointManager {
  constructor(private readonly projectRoot: string) {}

  async save(context: Context, events: RuntimeEvent[], stage?: string): Promise<void> {
    const snapshot: CheckpointSnapshot = {
      projectName: context.projectName,
      metadata: context.metadata,
      issues: context.getIssues(),
      recommendations: context.recommendations,
      repairLog: context.repairLog ?? [],
      repairLoop: context.repairLoop,
      repairSummary: context.repairSummary,
      health: context.health,
      verification: context.verification,
      events,
      stage,
    };

    const checkpointPath = path.join(this.projectRoot, ".satset-checkpoint.json");
    await fs.mkdir(this.projectRoot, { recursive: true });
    await fs.writeFile(checkpointPath, JSON.stringify(snapshot, null, 2), "utf8");
  }

  async restore(context: Context): Promise<CheckpointSnapshot | undefined> {
    const checkpointPath = path.join(this.projectRoot, ".satset-checkpoint.json");
    try {
      const content = await fs.readFile(checkpointPath, "utf8");
      const snapshot = JSON.parse(content) as CheckpointSnapshot;
      context.projectName = snapshot.projectName;
      context.recommendations = snapshot.recommendations;
      context.metadata = snapshot.metadata as typeof context.metadata;
      context.repairLog = snapshot.repairLog as typeof context.repairLog;
      context.repairLoop = snapshot.repairLoop as typeof context.repairLoop;
      context.repairSummary = snapshot.repairSummary as typeof context.repairSummary;
      context.health = snapshot.health as typeof context.health;
      context.verification = snapshot.verification;
      return snapshot;
    } catch {
      return undefined;
    }
  }
}
