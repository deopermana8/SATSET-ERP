import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";

export interface DecisionRecord {
  id: string;
  choice: string;
  rationale: string;
  confidence: number;
}

export class DecisionEngine {
  record(context: Context, choice: string, rationale: string, confidence: number): DecisionRecord {
    const record: DecisionRecord = {
      id: `decision-${Date.now()}`,
      choice,
      rationale,
      confidence,
    };

    void fs.mkdir(path.join(context.projectRoot, "knowledge"), { recursive: true })
      .then(() => fs.writeFile(path.join(context.projectRoot, "knowledge", "decisions.json"), JSON.stringify({ decisions: [record] }, null, 2), "utf8"));

    return record;
  }
}
