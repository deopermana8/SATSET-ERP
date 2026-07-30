import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { Issue } from "../../core/Issue.js";
import type { IEngine } from "../../core/IEngine.js";

export interface RepairLearningInput {
  issue: { id: string; title: string; category?: string; severity?: string };
  workspace: string;
  command: string;
  stdout: string;
  stderr: string;
  duration: number;
  verification: {
    passed: boolean;
    reasons: string[];
  };
}

export interface RepairKnowledgeRecord {
  id: string;
  timestamp: string;
  input: RepairLearningInput;
  output: {
    status: "applied" | "failed" | "skipped" | "dry-run";
    message: string;
    rollbackStatus: "none" | "restored" | "failed";
  };
}

interface RepairKnowledgeStore {
  version: string;
  updatedAt: string;
  records: RepairKnowledgeRecord[];
}

export class LearningEngine implements IEngine {
  public readonly name = "LearningEngine";

  async run(context: Context): Promise<void> {
    const outputPath = path.join(context.projectRoot, "knowledge", "repair-learning.json");
    const learningDocPath = path.join(context.projectRoot, "docs", "learning.md");
    const records = this.buildRecords(context);

    if (records.length > 0) {
      const existing = await this.loadStore(outputPath);
      const merged: RepairKnowledgeStore = {
        version: "1.0.0",
        updatedAt: new Date().toISOString(),
        records: [...existing.records, ...records],
      };

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(merged, null, 2), "utf8");
    }

    await fs.mkdir(path.dirname(learningDocPath), { recursive: true });
    await fs.writeFile(
      learningDocPath,
      [
        "# Learning",
        "",
        `Status: ${records.length > 0 ? "captured" : "no-repair-records"}`,
        `Record count: ${records.length}`,
        `Knowledge file: ${outputPath}`,
        "",
      ].join("\n"),
      "utf8"
    );

    context.metadata = {
      ...context.metadata,
      learning: {
        status: records.length > 0 ? "captured" : "no-repair-records",
        recordCount: records.length,
        filePath: outputPath,
        docPath: learningDocPath,
      },
    } as typeof context.metadata & {
      learning?: { status: string; recordCount: number; filePath: string; docPath: string };
    };
  }

  private buildRecords(context: Context): RepairKnowledgeRecord[] {
    const verification = this.resolveVerification(context);
    const fallbackDuration = context.repairSummary?.durationMs ?? 0;
    const issuesById = new Map<string, Issue>(context.getIssues().map((issue) => [issue.id, issue]));

    return (context.repairLog ?? []).map((entry, index) => {
      const issue = entry.stepId ? issuesById.get(entry.stepId) : undefined;
      const parsedCommand = this.extractCommand(entry.message) ?? context.repairSummary?.actualRepairAction ?? "unknown";

      return {
        id: `${entry.id}-${index}`,
        timestamp: entry.timestamp,
        input: {
          issue: {
            id: issue?.id ?? entry.stepId ?? entry.id,
            title: entry.title,
            category: issue?.category,
            severity: issue?.severity,
          },
          workspace: context.projectRoot,
          command: parsedCommand,
          stdout: this.extractStdout(entry.message),
          stderr: this.extractStderr(entry.message),
          duration: fallbackDuration,
          verification,
        },
        output: {
          status: entry.status,
          message: entry.message,
          rollbackStatus: entry.rollbackStatus ?? "none",
        },
      };
    });
  }

  private async loadStore(filePath: string): Promise<RepairKnowledgeStore> {
    try {
      const content = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(content) as RepairKnowledgeStore;
      if (Array.isArray(parsed.records)) {
        return parsed;
      }
    } catch {
      // Use default store when no prior file exists or parsing fails.
    }

    return {
      version: "1.0.0",
      updatedAt: new Date().toISOString(),
      records: [],
    };
  }

  private resolveVerification(context: Context): { passed: boolean; reasons: string[] } {
    const fromSummary = context.repairSummary?.verificationPassed;
    const fromVerification = typeof context.verification === "object" && context.verification !== null && "passed" in context.verification
      ? Boolean((context.verification as { passed?: boolean }).passed)
      : undefined;
    const reasons = context.repairSummary?.verificationReasons ??
      (typeof context.verification === "object" && context.verification !== null && "reasons" in context.verification
        ? ((context.verification as { reasons?: string[] }).reasons ?? [])
        : []);

    return {
      passed: fromSummary ?? fromVerification ?? false,
      reasons,
    };
  }

  private extractCommand(message: string): string | undefined {
    const match = message.match(/\(([^)]+)\)/);
    return match?.[1]?.trim();
  }

  private extractStdout(message: string): string {
    const marker = "stdout:";
    const index = message.toLowerCase().indexOf(marker);
    if (index === -1) {
      return "";
    }

    return message.slice(index + marker.length).trim();
  }

  private extractStderr(message: string): string {
    const marker = "stderr:";
    const index = message.toLowerCase().indexOf(marker);
    if (index === -1) {
      return "";
    }

    return message.slice(index + marker.length).trim();
  }
}
