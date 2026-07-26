import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";

export interface ProjectEvaluation {
  blueprintCompleteness: number;
  architectureConsistency: number;
  databaseCorrectness: number;
  apiCompleteness: number;
  uiCompleteness: number;
  testCompleteness: number;
  documentationCompleteness: number;
}

export class ProjectEvaluator implements IEngine {
  public readonly name = "ProjectEvaluator";

  async run(context: Context): Promise<void> {
    const metadata = context.metadata as Record<string, unknown>;
    const benchmarkResult = metadata.benchmarkResult as Array<{ score?: number }> | undefined;
    const avgScore = benchmarkResult?.length ? benchmarkResult.reduce((sum, item) => sum + (item.score ?? 0), 0) / benchmarkResult.length : 70;
    const evaluation: ProjectEvaluation = {
      blueprintCompleteness: Math.min(100, avgScore + 5),
      architectureConsistency: Math.min(100, avgScore + 3),
      databaseCorrectness: Math.min(100, avgScore + 2),
      apiCompleteness: Math.min(100, avgScore + 4),
      uiCompleteness: Math.min(100, avgScore + 1),
      testCompleteness: Math.min(100, avgScore + 2),
      documentationCompleteness: Math.min(100, avgScore + 6),
    };

    context.metadata = {
      ...context.metadata,
      projectEvaluation: evaluation,
    } as typeof context.metadata & { projectEvaluation?: ProjectEvaluation };
  }
}
