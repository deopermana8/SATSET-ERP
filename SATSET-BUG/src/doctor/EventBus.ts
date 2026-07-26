export interface EngineEvent {
  type: string;
  timestamp: string;
  stage?: string;
  engine?: string;
  details?: Record<string, unknown>;
}

export class EventBus {
  private readonly listeners = new Set<(event: EngineEvent) => void>();

  subscribe(listener: (event: EngineEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: EngineEvent): void {
    for (const listener of this.listeners) {
      listener({ ...event, timestamp: event.timestamp || new Date().toISOString() });
    }
  }

  emitLifecycle(type: string, engine?: string, stage?: string, details?: Record<string, unknown>): void {
    this.emit({ type, timestamp: new Date().toISOString(), engine, stage, details });
  }
}
