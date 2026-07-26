import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HistoryManager } from "./HistoryManager.js";
import type { Context } from "../core/Context.js";
import { ProjectFingerprintCalculator } from "../core/ProjectFingerprint.js";
import type { HistoryRecord } from "./History.js";

export class HistoryEngine {
  private readonly manager: HistoryManager;
  private readonly fingerprintCalculator = new ProjectFingerprintCalculator();

  constructor(root: string) {
    this.manager = new HistoryManager(root);
  }

  save(context: Context, durationMs: number): void {
    const fingerprint = this.fingerprintCalculator.generate(context);
    const scanId = this.manager.nextScanId(fingerprint.hash);
    const record: HistoryRecord = {
      scanId,
      projectName: context.projectName,
      fingerprint,
      timestamp: new Date().toISOString(),
      durationMs,
      doctorVersion: this.getDoctorVersion(),
      health: context.health ?? null,
      issues: [...context.getIssues()].sort((left, right) => left.id.localeCompare(right.id)),
      diagnosis: context.diagnosis?.slice().sort((left, right) => (left.id ?? "").localeCompare(right.id ?? "")),
      rootCauses: context.rootCauses?.slice().sort((left, right) => left.id.localeCompare(right.id)),
      repairPlans: context.repairPlans?.slice().sort((left, right) => left.id.localeCompare(right.id)),
      repairLog: context.repairLog?.slice(),
      repairLoop: context.repairLoop,
      repairSummary: context.repairSummary,
      verification: context.verification,
      metadata: context.metadata,
    };
    this.manager.save(record);
  }

  load(scanId: string) {
    return this.manager.load(scanId);
  }

  latest() {
    return this.manager.latest();
  }

  list() {
    return this.manager.list();
  }

  compare(scanA: string, scanB: string) {
    return this.manager.compare(scanA, scanB);
  }

  private getDoctorVersion(): string {
    try {
      const packagePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "package.json");
      const content = fs.readFileSync(packagePath, "utf8");
      const pkg = JSON.parse(content) as { version?: string };
      return pkg.version ?? "unknown";
    } catch {
      return "unknown";
    }
  }
}
