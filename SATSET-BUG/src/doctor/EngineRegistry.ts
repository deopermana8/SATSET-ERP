import type { IEngine } from "../core/IEngine.js";

export class EngineRegistry {
  private readonly engines = new Map<string, IEngine>();

  register(engine: IEngine): void {
    this.engines.set(engine.name, engine);
  }

  get(name: string): IEngine | undefined {
    return this.engines.get(name);
  }

  list(): IEngine[] {
    return Array.from(this.engines.values());
  }
}
