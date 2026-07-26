import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";

export interface CompileEvaluation {
  compileSuccess: number;
  repairAttempts: number;
  retryCount: number;
  repairDuration: number;
  buildDuration: number;
}

export class CompileEvaluator implements IEngine {
  public readonly name = "CompileEvaluator";

  async run(context: Context): Promise<void> {
    const metadata = context.metadata as Record<string, unknown>;
    const repairMemory = metadata.repairMemory as { entries?: Array<unknown> } | undefined;
    const buildLoop = metadata.buildLoop as { report?: { compilerResult?: { succeeded?: boolean }; summary?: { durationMs?: number } } } | undefined;
    const retryPolicy = metadata.retryPolicy as { maxAttempts?: number } | undefined;

    const compileSuccess = buildLoop?.report?.compilerResult?.succeeded ? 100 : 60;
    const repairAttempts = Math.max(1, (repairMemory?.entries?.length ?? 0));
    const retryCount = retryPolicy?.maxAttempts ?? 3;
    const repairDuration = buildLoop?.report?.summary?.durationMs ?? 0;
    const buildDuration = buildLoop?.report?.summary?.durationMs ?? 0;

    const evaluation: CompileEvaluation = {
      compileSuccess,
      repairAttempts,
      retryCount,
      repairDuration,
      buildDuration,
    };

    context.metadata = {
      ...context.metadata,
      compileEvaluation: evaluation,
    } as typeof context.metadata & { compileEvaluation?: CompileEvaluation };
  }
}
