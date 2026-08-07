import { FactoryRuntimeBridge, FactoryRuntimeResult } from "./FactoryRuntimeBridge.js";

export interface IFactoryPipelineExecutor {
  run(projectRoot: string): Promise<FactoryRuntimeResult[]>;
}

export class FactoryPipelineExecutor implements IFactoryPipelineExecutor {
  private readonly bridge = new FactoryRuntimeBridge();

  async run(projectRoot: string): Promise<FactoryRuntimeResult[]> {
    const results: FactoryRuntimeResult[] = [];
    const commands: Array<"autofix" | "doctor" | "repair" | "build"> = ["autofix", "doctor", "repair", "build"];

    for (const command of commands) {
      results.push(await this.bridge.run(projectRoot, command));
    }

    return results;
  }
}
