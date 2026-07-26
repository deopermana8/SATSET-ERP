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
    const groups: ExecutionGroup[] = [];
    const ordered = engines.map((engine) => this.getManifest(engine));
    for (let index = 0; index < ordered.length; index += 1) {
      const manifest = ordered[index];
      groups.push({
        id: manifest.id,
        engines: [engines[index]],
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
