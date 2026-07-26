import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";

export interface DecisionOutput {
  action: string;
  retry: boolean;
  rollback: boolean;
}

export class DecisionEngine implements IEngine {
  public readonly name = "DecisionEngine";

  async run(context: Context): Promise<void> {
    const output: DecisionOutput = {
      action: "continue",
      retry: false,
      rollback: false,
    };

    context.metadata = {
      ...context.metadata,
      decision: output,
    } as typeof context.metadata & { decision?: DecisionOutput };
  }
}
