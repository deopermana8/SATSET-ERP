import type { Diagnosis } from "./Diagnosis.js";

export class DiagnosisManager {
  private readonly diagnoses: Diagnosis[] = [];

  add(d: Diagnosis): void {
    this.diagnoses.push(d);
  }

  addMany(ds: Diagnosis[]): void {
    this.diagnoses.push(...ds);
  }

  getAll(): readonly Diagnosis[] {
    return [...this.diagnoses];
  }

  clear(): void {
    this.diagnoses.length = 0;
  }
}

export default DiagnosisManager;
