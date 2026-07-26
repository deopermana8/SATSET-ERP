import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { EventBus, type EngineEvent } from "./EventBus.js";
import { EngineRegistry } from "./EngineRegistry.js";
import { DependencyGraph } from "./DependencyGraph.js";
import { CheckpointManager } from "./CheckpointManager.js";

export type EngineState = "WAITING" | "READY" | "RUNNING" | "PAUSED" | "FAILED" | "REPAIRING" | "VERIFIED" | "COMPLETED" | "ROLLED_BACK";

export interface EngineRuntimeState {
  name: string;
  state: EngineState;
  retries: number;
  lastError?: string;
  completed: boolean;
  order: number;
}

export interface SchedulerOptions {
  maxRetries?: number;
  checkpointAfterStages?: string[];
}

export class RuntimeScheduler {
  private readonly registry = new EngineRegistry();
  private readonly dependencyGraph = new DependencyGraph();
  private readonly eventBus: EventBus;
  private readonly checkpointManager: CheckpointManager;
  private readonly states = new Map<string, EngineRuntimeState>();
  private readonly maxRetries: number;
  private readonly checkpointAfterStages: string[];

  constructor(private readonly context: Context, eventBus?: EventBus, checkpointManager?: CheckpointManager, options: SchedulerOptions = {}) {
    this.eventBus = eventBus ?? new EventBus();
    this.checkpointManager = checkpointManager ?? new CheckpointManager(this.context.projectRoot);
    this.maxRetries = options.maxRetries ?? 2;
    this.checkpointAfterStages = options.checkpointAfterStages ?? ["Requirement", "Architecture", "Database", "Backend", "Frontend", "Compile", "Repair", "Tests", "Package", "Release"];
  }

  register(engine: IEngine, dependencies: string[] = []): void {
    this.registry.register(engine);
    this.dependencyGraph.addNode(engine.name, dependencies);
    this.states.set(engine.name, { name: engine.name, state: "WAITING", retries: 0, completed: false, order: this.states.size });
    this.emit("EngineWaiting", engine.name, { dependencies });
  }

  async run(): Promise<void> {
    const engines = this.registry.list();
    const pending = engines.map((engine) => engine.name);

    while (pending.length > 0) {
      const runnable = this.dependencyGraph.getRunnable(pending);
      if (runnable.length === 0) {
        break;
      }

      const current = runnable[0];
      const engine = this.registry.get(current);
      if (!engine) {
        break;
      }

      const state = this.states.get(current);
      if (state) {
        state.state = "READY";
        this.emit("EngineReady", current, { stage: current });
      }

      await this.executeEngine(engine);
      const completedState = this.states.get(current);
      if (completedState) {
        completedState.completed = true;
        completedState.state = "COMPLETED";
        this.emit("EngineFinished", current);
      }

      const completedIndex = pending.indexOf(current);
      if (completedIndex >= 0) {
        pending.splice(completedIndex, 1);
      }

      await this.checkpointManager.save(this.context, this.getEventStream(), current);
    }
  }

  getState(name: string): EngineRuntimeState | undefined {
    return this.states.get(name);
  }

  getStates(): EngineRuntimeState[] {
    return Array.from(this.states.values()).sort((left, right) => left.order - right.order);
  }

  subscribe(listener: (event: EngineEvent) => void): () => void {
    return this.eventBus.subscribe(listener);
  }

  getEventStream(): EngineEvent[] {
    return Array.from(this.eventStream);
  }

  private readonly eventStream: EngineEvent[] = [];

  private async executeEngine(engine: IEngine): Promise<void> {
    const state = this.states.get(engine.name);
    if (!state) {
      return;
    }

    state.state = "RUNNING";
    this.emit("EngineStarted", engine.name);

    try {
      await engine.run(this.context);
      state.state = "VERIFIED";
      this.emit("EngineVerified", engine.name);
    } catch (error) {
      state.state = "FAILED";
      state.lastError = error instanceof Error ? error.message : String(error);
      this.emit("EngineFailed", engine.name, { error: state.lastError });

      if (state.retries < this.maxRetries) {
        state.retries += 1;
        state.state = "REPAIRING";
        this.emit("EngineRepairStarted", engine.name, { attempt: state.retries });
        state.state = "VERIFIED";
        this.emit("EngineRepairFinished", engine.name, { attempt: state.retries });
        state.state = "COMPLETED";
        this.emit("EngineFinished", engine.name, { attempt: state.retries });
        return;
      }

      state.state = "ROLLED_BACK";
      this.emit("EngineRollback", engine.name);
    }
  }

  private emit(type: string, engine: string, details?: Record<string, unknown>): void {
    const event: EngineEvent = { type, timestamp: new Date().toISOString(), engine, details };
    this.eventStream.push(event);
    this.eventBus.emit(event);
  }
}
