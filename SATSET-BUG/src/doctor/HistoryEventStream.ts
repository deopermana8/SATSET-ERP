import type { EngineEvent } from "./EventBus.js";
import { EventBus } from "./EventBus.js";
import { HistoryEngine } from "../history/HistoryEngine.js";
import type { Context } from "../core/Context.js";

export class HistoryEventStream {
  constructor(private readonly context: Context, private readonly eventBus: EventBus, private readonly historyEngine: HistoryEngine) {
    this.eventBus.subscribe((event) => {
      this.append(event);
    });
  }

  private append(event: EngineEvent): void {
    const records = (this.context.metadata as { historyEvents?: EngineEvent[] }).historyEvents ?? [];
    const next = [...records, event];
    this.context.metadata = {
      ...this.context.metadata,
      historyEvents: next,
    } as typeof this.context.metadata & { historyEvents?: EngineEvent[] };
    this.historyEngine.save(this.context, 0);
  }
}
