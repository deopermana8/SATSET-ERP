import fs from "node:fs/promises";
import path from "node:path";
import type { AgentExecutionEntry } from "./ExecutionContext.js";

export interface AgentMemoryStore {
  entries: AgentExecutionEntry[];
}

export interface AgentMemoryRecord {
  goalId: string;
  taskId: string;
  status: AgentExecutionEntry["status"];
  summary: string;
  error?: string;
}

export class AgentMemory {
  constructor(private readonly root: string = process.cwd()) {}

  async record(entry: AgentMemoryRecord): Promise<AgentExecutionEntry> {
    const store = await this.load();
    const item: AgentExecutionEntry = {
      id: `entry-${store.entries.length + 1}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    store.entries.push(item);
    this.entries = store.entries;
    await this.persist(store);
    return item;
  }

  recall(goalId: string): AgentExecutionEntry[] {
    return [...this.entries].filter((entry) => entry.goalId === goalId);
  }

  private entries: AgentExecutionEntry[] = [];

  private async load(): Promise<AgentMemoryStore> {
    const filePath = this.getFilePath();
    try {
      const content = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(content) as AgentMemoryStore;
      this.entries = parsed.entries;
      return parsed;
    } catch {
      this.entries = [];
      return { entries: [] };
    }
  }

  private async persist(store: AgentMemoryStore): Promise<void> {
    const filePath = this.getFilePath();
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(store, null, 2), "utf8");
  }

  private getFilePath(): string {
    return path.join(this.root, "knowledge", "agent-history.json");
  }
}
