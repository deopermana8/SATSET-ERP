import type { IEngine } from "../core/IEngine.js";
import type { EngineManifest, ManifestAwareEngine } from "./EngineManifest.js";

export interface EngineRegistration {
  id: string;
  name: string;
  priority: number;
  dependencies: string[];
  timeoutMs: number;
  retryPolicy: { maxAttempts: number; backoffMs: number };
  checkpoint: boolean;
  health: "healthy" | "degraded" | "failing";
  manifest?: EngineManifest;
}

export class EngineRegistry {
  private readonly registrations = new Map<string, EngineRegistration>();

  register(engine: IEngine, registration: Partial<EngineRegistration> = {}): void {
    const manifest = this.getManifest(engine);
    const key = registration.id ?? manifest.id ?? engine.name;
    if (this.registrations.has(key)) {
      throw new Error(`Duplicate engine id ${key}`);
    }
    this.registrations.set(key, {
      id: key,
      name: engine.name,
      priority: registration.priority ?? manifest.priority ?? 0,
      dependencies: registration.dependencies ?? manifest.dependencies ?? [],
      timeoutMs: registration.timeoutMs ?? manifest.timeout ?? 30000,
      retryPolicy: registration.retryPolicy ?? { maxAttempts: manifest.retryPolicy.retries + 1, backoffMs: manifest.retryPolicy.backoff },
      checkpoint: registration.checkpoint ?? true,
      health: registration.health ?? "healthy",
      manifest,
    });
  }

  has(id: string): boolean {
    return this.resolve(id) !== undefined;
  }

  registerIfMissing(
    engine: IEngine,
    registration: Partial<EngineRegistration> = {}
  ): boolean {
    const manifest = this.getManifest(engine);
    const key = registration.id ?? manifest.id ?? engine.name;

    if (this.has(key)) {
      return false;
    }

    this.register(engine, registration);
    return true;
  }

  unregister(name: string): void {
    this.registrations.delete(name);
  }

  discover(): EngineRegistration[] {
    return Array.from(this.registrations.values()).sort((left, right) => right.priority - left.priority || left.name.localeCompare(right.name));
  }

  list(): EngineRegistration[] {
    return this.discover();
  }

  get(name: string): EngineRegistration | undefined {
    return this.resolve(name);
  }

  resolve(name: string): EngineRegistration | undefined {
    const exact = this.registrations.get(name);
    if (exact) {
      return exact;
    }

    const normalized = name.toLowerCase();
    return Array.from(this.registrations.values()).find((entry) => {
      const candidates = [entry.id, entry.name, entry.manifest?.id, entry.manifest?.name];
      return candidates.some((candidate) => candidate?.toLowerCase() === normalized);
    });
  }

  validate(): string[] {
    const errors: string[] = [];
    const entries = this.discover();
    for (const entry of entries) {
      if (!entry.manifest?.id) {
        errors.push(`Missing manifest id for ${entry.name}`);
      }
      for (const dependency of entry.dependencies) {
        if (!entries.some((item) => item.id === dependency || item.name === dependency)) {
          errors.push(`Missing dependency ${dependency} for ${entry.name}`);
        }
      }
    }
    return errors;
  }

  private getManifest(engine: IEngine): EngineManifest {
    const manifestAware = engine as unknown as ManifestAwareEngine;
    return typeof manifestAware.getManifest === "function"
      ? manifestAware.getManifest()
      : {
          id: engine.name.toLowerCase(),
          name: engine.name,
          version: "1.0.0",
          author: "satset",
          category: "runtime",
          priority: 0,
          enabled: true,
          timeout: 30000,
          retryPolicy: { retries: 0, backoff: 0 },
          dependencies: [],
          tags: [],
        };
  }
}
