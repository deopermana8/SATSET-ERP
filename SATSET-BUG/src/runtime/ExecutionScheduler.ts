import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { PipelineResolver } from "./PipelineResolver.js";

export interface ExecutionGroup {
  id: string;
  engines: IEngine[];
  parallel: boolean;
  dependencies: string[];
}

export class ExecutionScheduler {
  constructor(private readonly pipelineResolver: PipelineResolver = new PipelineResolver()) {}

  createGroups(engines: IEngine[]): ExecutionGroup[] {
    return this.pipelineResolver.createGroups(engines).map((group) => ({
      id: group.id,
      engines: group.engines,
      parallel: group.parallel,
      dependencies: group.dependencies,
    }));
  }

  async run(context: Context, groups: ExecutionGroup[]): Promise<void> {
    for (const group of groups) {
      for (const engine of group.engines) {
        await engine.run(context);
      }
    }
  }
}
