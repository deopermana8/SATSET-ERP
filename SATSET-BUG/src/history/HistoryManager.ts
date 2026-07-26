import { HistoryRepository } from "./HistoryRepository.js";
import type { HistoryComparison, HistoryRecord } from "./History.js";

export class HistoryManager {
  private readonly repository: HistoryRepository;

  constructor(root: string) {
    this.repository = new HistoryRepository(root);
  }

  save(record: HistoryRecord): void {
    this.repository.save(record);
  }

  load(scanId: string): HistoryRecord | null {
    return this.repository.load(scanId);
  }

  latest(): HistoryRecord | null {
    return this.repository.latest();
  }

  list(): HistoryRecord[] {
    return this.repository.list();
  }

  compare(scanA: string, scanB: string): HistoryComparison | null {
    return this.repository.compare(scanA, scanB);
  }

  nextScanId(fingerprintHash: string): string {
    return this.repository.nextScanId(fingerprintHash);
  }
}
