import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";

export interface CheckpointOutput {
  checkpointPath: string;
  created: boolean;
}

export class CheckpointEngine implements IEngine {
  public readonly name = "CheckpointEngine";

  async run(context: Context): Promise<void> {
    const checkpointDir = path.join(context.projectRoot, ".checkpoints");
    await fs.mkdir(checkpointDir, { recursive: true });
    const output: CheckpointOutput = {
      checkpointPath: checkpointDir,
      created: true,
    };

    context.metadata = {
      ...context.metadata,
      checkpoint: output,
    } as typeof context.metadata & { checkpoint?: CheckpointOutput };
  }
}
