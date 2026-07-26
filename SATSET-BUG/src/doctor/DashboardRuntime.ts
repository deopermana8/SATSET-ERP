import type { Context } from "../core/Context.js";
import { EventBus, type EngineEvent } from "./EventBus.js";

export interface DashboardSnapshot {
  runningEngines: string[];
  waitingEngines: string[];
  completedEngines: string[];
  failedEngines: string[];
  retryCount: number;
  elapsedTimeMs: number;
  etaMs: number;
  currentArtifact: string;
  currentRepairLoop: number;
}

export class DashboardRuntime {
  private readonly snapshot: DashboardSnapshot;

  constructor(private readonly context: Context, private readonly eventBus: EventBus) {
    this.snapshot = {
      runningEngines: [],
      waitingEngines: [],
      completedEngines: [],
      failedEngines: [],
      retryCount: 0,
      elapsedTimeMs: 0,
      etaMs: 0,
      currentArtifact: "",
      currentRepairLoop: 0,
    };

    this.eventBus.subscribe((event) => this.apply(event));
  }

  getSnapshot(): DashboardSnapshot {
    return { ...this.snapshot };
  }

  private apply(event: EngineEvent): void {
    if (event.type === "EngineStarted") {
      this.snapshot.runningEngines = [...new Set([...this.snapshot.runningEngines, event.engine ?? ""])]
        .filter(Boolean);
    }

    if (event.type === "EngineFinished") {
      this.snapshot.completedEngines = [...new Set([...this.snapshot.completedEngines, event.engine ?? ""])]
        .filter(Boolean);
      this.snapshot.runningEngines = this.snapshot.runningEngines.filter((name) => name !== event.engine);
    }

    if (event.type === "EngineFailed") {
      this.snapshot.failedEngines = [...new Set([...this.snapshot.failedEngines, event.engine ?? ""])]
        .filter(Boolean);
      this.snapshot.runningEngines = this.snapshot.runningEngines.filter((name) => name !== event.engine);
    }
  }
}
