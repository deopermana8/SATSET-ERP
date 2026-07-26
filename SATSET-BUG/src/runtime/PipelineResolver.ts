import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { EngineRegistry } from "./EngineRegistry.js";
import type { EngineManifest, ManifestAwareEngine } from "./EngineManifest.js";

export interface PipelineGroup {
  id: string;
  engines: IEngine[];
  parallel: boolean;
  dependencies: string[];
}

export class PipelineResolver {
  constructor(private readonly registry: EngineRegistry = new EngineRegistry()) {}

  resolve(engines: IEngine[]): IEngine[] {
    const manifestMap = new Map<string, EngineManifest>();
    const ordered: IEngine[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (engine: IEngine): void => {
      const manifest = this.getManifest(engine);
      const id = manifest.id;
      if (visiting.has(id)) {
        throw new Error(`Circular dependency detected for engine ${id}`);
      }
      if (visited.has(id)) {
        return;
      }
      visiting.add(id);
      manifestMap.set(id, manifest);
      for (const dependencyId of manifest.dependencies) {
        const dependency = engines.find((candidate) => this.getManifest(candidate).id === dependencyId);
        if (!dependency) {
          continue;
        }
        visit(dependency);
      }
      visiting.delete(id);
      visited.add(id);
      ordered.push(engine);
    };

    for (const engine of engines) {
      visit(engine);
    }

    return ordered;
  }

  createGroups(engines: IEngine[]): PipelineGroup[] {
    const ordered = this.resolve(engines);
    const groups: PipelineGroup[] = [];
    let current: IEngine[] = [];
    for (const engine of ordered) {
      if (current.length === 0) {
        current = [engine];
        continue;
      }
      current.push(engine);
    }
    if (current.length > 0) {
      groups.push({ id: "group-1", engines: current, parallel: false, dependencies: [] });
    }
    return groups;
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
