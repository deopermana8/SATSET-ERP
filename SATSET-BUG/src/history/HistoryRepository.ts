import fs from "node:fs";
import path from "node:path";
import type { HistoryComparison, HistoryRecord } from "./History.js";
import { HistorySerializer } from "./HistorySerializer.js";

export class HistoryRepository {
  private readonly root: string;
  private readonly serializer = new HistorySerializer();

  constructor(root: string) {
    this.root = root;
  }

  save(record: HistoryRecord): void {
    const historyDir = this.ensureHistoryDirectory(record.fingerprint.hash);
    const fileName = `scan-${record.scanId.padStart(6, "0")}.json`;
    const filePath = path.join(historyDir, fileName);
    fs.writeFileSync(filePath, this.serializer.serialize(record), "utf8");
  }

  load(scanId: string): HistoryRecord | null {
    const historyDirs = this.getFingerprintDirectories();
    for (const dir of historyDirs) {
      const filePath = path.join(dir, `scan-${scanId.padStart(6, "0")}.json`);
      if (fs.existsSync(filePath)) {
        return this.serializer.deserialize(fs.readFileSync(filePath, "utf8"));
      }
    }
    return null;
  }

  latest(): HistoryRecord | null {
    const historyDirs = this.getFingerprintDirectories();
    let latestRecord: HistoryRecord | null = null;

    for (const dir of historyDirs) {
      const files = fs.readdirSync(dir).filter((name) => /^scan-\d{6}\.json$/.test(name)).sort().reverse();
      if (files.length === 0) continue;
      const record = this.serializer.deserialize(fs.readFileSync(path.join(dir, files[0]), "utf8"));
      if (!latestRecord || new Date(record.timestamp) > new Date(latestRecord.timestamp)) {
        latestRecord = record;
      }
    }

    return latestRecord;
  }

  list(): HistoryRecord[] {
    const records: HistoryRecord[] = [];
    const historyDirs = this.getFingerprintDirectories();
    for (const dir of historyDirs) {
      const files = fs.readdirSync(dir).filter((name) => /^scan-\d{6}\.json$/.test(name)).sort();
      for (const file of files) {
        records.push(this.serializer.deserialize(fs.readFileSync(path.join(dir, file), "utf8")));
      }
    }
    return records;
  }

  compare(scanA: string, scanB: string): HistoryComparison | null {
    const recordA = this.load(scanA);
    const recordB = this.load(scanB);
    if (!recordA || !recordB) return null;

    const differences: Record<string, { a: unknown; b: unknown }> = {};
    const keys = new Set([...Object.keys(recordA), ...Object.keys(recordB)]);
    for (const key of keys) {
      const aValue = (recordA as unknown as Record<string, unknown>)[key];
      const bValue = (recordB as unknown as Record<string, unknown>)[key];
      if (JSON.stringify(aValue) !== JSON.stringify(bValue)) {
        differences[key] = { a: aValue, b: bValue };
      }
    }

    const issueKey = (issue: { id: string; message: string }) => `${issue.id}::${issue.message}`;
    const issueMapA = new Map(recordA.issues.map((issue) => [issueKey(issue), issue]));
    const issueMapB = new Map(recordB.issues.map((issue) => [issueKey(issue), issue]));

    const newIssues = recordB.issues.filter((issue) => !issueMapA.has(issueKey(issue)));
    const fixedIssues = recordA.issues.filter((issue) => !issueMapB.has(issueKey(issue)));
    const unchangedIssues = recordB.issues.filter((issue) => issueMapA.has(issueKey(issue)));

    const healthDelta = (recordB.health?.score ?? 0) - (recordA.health?.score ?? 0);
    const scoreDelta = healthDelta;
    const severityDelta = unchangedIssues.filter((issue) => {
      const previous = issueMapA.get(issueKey(issue));
      return previous ? previous.severity !== issue.severity : false;
    }).length;

    return {
      scanA,
      scanB,
      sameFingerprint: recordA.fingerprint.hash === recordB.fingerprint.hash,
      differences,
      newIssues,
      fixedIssues,
      unchangedIssues,
      healthDelta,
      scoreDelta,
      severityDelta,
    };
  }

  nextScanId(fingerprintHash: string): string {
    const historyDir = path.join(this.getHistoryRoot(), fingerprintHash);
    if (!fs.existsSync(historyDir)) {
      return "1";
    }

    const files = fs.readdirSync(historyDir).filter((name) => /^scan-\d{6}\.json$/.test(name));
    const highest = files
      .map((file) => Number(file.replace(/^scan-(\d{6})\.json$/, "$1")))
      .filter(Number.isFinite)
      .sort((a, b) => b - a)[0];

    return highest ? String(highest + 1) : "1";
  }

  private ensureHistoryDirectory(fingerprintHash: string): string {
    const historyRoot = this.getHistoryRoot();
    const fingerprintDir = path.join(historyRoot, fingerprintHash);
    if (!fs.existsSync(historyRoot)) {
      fs.mkdirSync(historyRoot, { recursive: true });
    }
    if (!fs.existsSync(fingerprintDir)) {
      fs.mkdirSync(fingerprintDir, { recursive: true });
    }
    return fingerprintDir;
  }

  private getHistoryRoot(): string {
    return path.join(this.root, ".history");
  }

  private getFingerprintDirectories(): string[] {
    const historyRoot = this.getHistoryRoot();
    if (!fs.existsSync(historyRoot)) return [];
    return fs.readdirSync(historyRoot)
      .map((name) => path.join(historyRoot, name))
      .filter((dir) => fs.statSync(dir).isDirectory());
  }
}
