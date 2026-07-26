import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";

export interface ResumeOutput {
  resumed: boolean;
  fromTask: string;
}

export class ResumeEngine implements IEngine {
  public readonly name = "ResumeEngine";

  async run(context: Context): Promise<void> {
    const output: ResumeOutput = {
      resumed: false,
      fromTask: "start",
    };

    context.metadata = {
      ...context.metadata,
      resume: output,
    } as typeof context.metadata & { resume?: ResumeOutput };
  }
}
