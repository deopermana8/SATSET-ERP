import type { IEngine } from "../core/IEngine.js";
import { EngineRegistry as RuntimeEngineRegistry } from "../runtime/EngineRegistry.js";

export class EngineRegistry {
  private readonly registry: RuntimeEngineRegistry;

  constructor(registry: RuntimeEngineRegistry = new RuntimeEngineRegistry()) {
    this.registry = registry;
  }

  register(engine: IEngine): void {
    this.registry.register(engine);
  }

  get(name: string): IEngine | undefined {
    const registration = this.registry.get(name);
    return registration ? ({ name: registration.name } as IEngine) : undefined;
  }

  list(): IEngine[] {
    return this.registry.list().map((registration) => ({ name: registration.name } as IEngine));
  }
}
