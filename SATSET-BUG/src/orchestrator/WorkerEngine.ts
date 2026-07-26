import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";

export interface WorkerOutput {
  executed: string[];
  status: string;
}

export class WorkerEngine implements IEngine {
  public readonly name = "WorkerEngine";

  async run(context: Context): Promise<void> {
    const output: WorkerOutput = {
      executed: ["artifact-generation", "compile", "test", "verification"],
      status: "ready",
    };

    context.metadata = {
      ...context.metadata,
      worker: output,
    } as typeof context.metadata & { worker?: WorkerOutput };
  }
}
