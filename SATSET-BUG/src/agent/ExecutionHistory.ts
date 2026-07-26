import fs from "node:fs";
import path from "node:path";
import type { AgentExecutionEntry } from "./ExecutionContext.js";

export interface ExecutionHistoryStore {
  entries: AgentExecutionEntry[];
}

export class ExecutionHistory {
  constructor(private readonly root: string = process.cwd()) {}

  push(entry: AgentExecutionEntry): void {
    this.entries.push(entry);
    this.persist();
  }

  snapshot(): ExecutionHistoryStore {
    return { entries: [...this.entries] };
  }

  private readonly entries: AgentExecutionEntry[] = [];

  private persist(): void {
    const filePath = path.join(this.root, "knowledge", "execution-history.json");
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ entries: this.entries }, null, 2), "utf8");
  }
}
