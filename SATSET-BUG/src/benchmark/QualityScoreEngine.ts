import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";

export interface QualityScore {
  blueprintAccuracy: number;
  compileSuccess: number;
  repairSuccess: number;
  knowledgeReuse: number;
  architectureQuality: number;
  testQuality: number;
  documentationQuality: number;
  overallScore: number;
}

export class QualityScoreEngine implements IEngine {
  public readonly name = "QualityScoreEngine";

  async run(context: Context): Promise<void> {
    const projectEvaluation = (context.metadata as Record<string, unknown>).projectEvaluation as {
      blueprintCompleteness?: number;
      architectureConsistency?: number;
      apiCompleteness?: number;
      uiCompleteness?: number;
      testCompleteness?: number;
      documentationCompleteness?: number;
    } | undefined;
    const compileEvaluation = (context.metadata as Record<string, unknown>).compileEvaluation as {
      compileSuccess?: number;
      repairAttempts?: number;
    } | undefined;
    const knowledgeMetrics = (context.metadata as Record<string, unknown>).knowledgeMetrics as { reuseRate?: number } | undefined;

    const score: QualityScore = {
      blueprintAccuracy: projectEvaluation?.blueprintCompleteness ?? 70,
      compileSuccess: compileEvaluation?.compileSuccess ?? 60,
      repairSuccess: Math.min(100, 80 + (compileEvaluation?.repairAttempts ?? 1) * 2),
      knowledgeReuse: Math.round((knowledgeMetrics?.reuseRate ?? 0) * 100),
      architectureQuality: projectEvaluation?.architectureConsistency ?? 70,
      testQuality: projectEvaluation?.testCompleteness ?? 70,
      documentationQuality: projectEvaluation?.documentationCompleteness ?? 70,
      overallScore: 0,
    };

    score.overallScore = Math.round(
      (score.blueprintAccuracy * 0.2) +
      (score.compileSuccess * 0.2) +
      (score.repairSuccess * 0.15) +
      (score.knowledgeReuse * 0.1) +
      (score.architectureQuality * 0.15) +
      (score.testQuality * 0.1) +
      (score.documentationQuality * 0.1)
    );

    context.metadata = {
      ...context.metadata,
      qualityScore: score,
    } as typeof context.metadata & { qualityScore?: QualityScore };
  }
}
