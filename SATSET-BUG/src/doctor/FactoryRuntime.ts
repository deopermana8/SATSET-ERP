import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { HistoryEngine } from "../history/HistoryEngine.js";
import { EventBus } from "./EventBus.js";
import { RuntimeKernel, type RuntimeKernelEvent } from "../runtime/RuntimeKernel.js";

export interface RuntimeEvent extends RuntimeKernelEvent {}

export interface FactoryRuntimeOptions {
  engines: IEngine[];
  maxRetries?: number;
}

export class FactoryRuntime {
  private readonly history: HistoryEngine;
  private readonly events: RuntimeEvent[] = [];
  private readonly eventBus: EventBus;
  private readonly kernel: RuntimeKernel;

  constructor(private readonly context: Context, options: FactoryRuntimeOptions) {
    this.history = new HistoryEngine(this.context.projectRoot);
    this.eventBus = new EventBus();
    this.kernel = new RuntimeKernel(this.context, {
      engines: options.engines,
      maxRetries: options.maxRetries,
      history: this.history,
      eventBus: this.eventBus,
      onEvent: (event) => {
        this.events.push(event);
      },
    });
  }

  async run(): Promise<void> {
    await this.kernel.run();
    this.context.metadata = {
      ...this.context.metadata,
      historyEvents: this.events,
    } as typeof this.context.metadata & { historyEvents?: RuntimeEvent[] };
  }
}
