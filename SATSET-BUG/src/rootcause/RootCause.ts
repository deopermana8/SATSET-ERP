import type { Issue } from "../core/Issue.js";

export interface RootCause {
  id: string;
  title: string;
  confidence: number; // 0-100
  description: string;
  causes: string[]; // contributing cause ids or short descriptions
  evidence: Issue[]; // issues/evidence that lead to this root cause
  repairSteps: string[];
  priority: number; // higher = more urgent
}

export class RootCauseImpl implements RootCause {
  id: string;
  title: string;
  confidence: number;
  description: string;
  causes: string[];
  evidence: Issue[];
  repairSteps: string[];
  priority: number;

  constructor(init: Partial<RootCause> & { id: string; title: string }) {
    this.id = init.id;
    this.title = init.title;
    this.confidence = init.confidence ?? 0;
    this.description = init.description ?? "";
    this.causes = init.causes ?? [];
    this.evidence = init.evidence ?? [];
    this.repairSteps = init.repairSteps ?? [];
    this.priority = init.priority ?? 0;
  }
}

export default RootCauseImpl;
