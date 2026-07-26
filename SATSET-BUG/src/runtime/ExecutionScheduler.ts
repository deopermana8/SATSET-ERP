import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import type { EngineManifest, ManifestAwareEngine } from "./EngineManifest.js";

export interface ExecutionGroup {
  id: string;
  engines: IEngine[];
  parallel: boolean;
  dependencies: string[];
}

export class ExecutionScheduler {
  async createGroups(engines: IEngine[]): Promise<ExecutionGroup[]> {
    const ordered = this.orderEngines(engines);
    const groups: ExecutionGroup[] = [];
    for (const engine of ordered) {
      const manifest = this.getManifest(engine);
      groups.push({
        id: manifest.id,
        engines: [engine],
        parallel: false,
        dependencies: manifest.dependencies,
      });
    }
    return groups;
  }

  async run(context: Context, groups: ExecutionGroup[]): Promise<void> {
    for (const group of groups) {
      for (const engine of group.engines) {
        await engine.run(context);
      }
    }
  }

  private orderEngines(engines: IEngine[]): IEngine[] {
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
      for (const dependencyId of manifest.dependencies) {
        const dependency = engines.find((candidate) => this.getManifest(candidate).id === dependencyId);
        if (dependency) {
          visit(dependency);
        }
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
