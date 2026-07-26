export interface ProjectMatrixEntry {
  name: string;
  status: "pending" | "validated" | "failed";
  score: number;
}

export class ProjectMatrix {
  private readonly entries: ProjectMatrixEntry[] = [
    { name: "POS", status: "pending", score: 0 },
    { name: "HRIS", status: "pending", score: 0 },
    { name: "Inventory", status: "pending", score: 0 },
    { name: "ERP", status: "pending", score: 0 },
    { name: "Village System", status: "pending", score: 0 },
    { name: "Tourism", status: "pending", score: 0 },
    { name: "CMS", status: "pending", score: 0 },
    { name: "LMS", status: "pending", score: 0 },
  ];

  getEntries(): ProjectMatrixEntry[] {
    return this.entries.map((entry) => ({ ...entry }));
  }

  markValidated(name: string, score: number): void {
    const entry = this.entries.find((item) => item.name === name);
    if (entry) {
      entry.status = "validated";
      entry.score = score;
    }
  }

  markFailed(name: string): void {
    const entry = this.entries.find((item) => item.name === name);
    if (entry) {
      entry.status = "failed";
      entry.score = 0;
    }
  }
}
