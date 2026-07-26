import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";
import path from "node:path";

export interface RetryPolicyState {
  maxAttempts: number;
  backoffMs: number;
  shouldRetry: boolean;
  reason: string;
}

export class RetryPolicyEngine implements IEngine {
  public readonly name = "RetryPolicyEngine";

  async run(context: Context): Promise<void> {
    const patchValidation = (context.metadata as Record<string, unknown>).patchValidation as { valid?: boolean } | undefined;
    const failureReport = (context.metadata as Record<string, unknown>).failureReport as { category?: string } | undefined;
    const category = failureReport?.category ?? "typescript";
    const shouldRetry = patchValidation?.valid === false || Boolean(failureReport);
    const baseBackoff = category === "runtime" ? 100 : 50;
    const state: RetryPolicyState = {
      maxAttempts: 3,
      backoffMs: shouldRetry ? baseBackoff * 2 : baseBackoff,
      shouldRetry,
      reason: shouldRetry ? "patch validation failed" : "validation passed",
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "retry-report",
      name: "retry-report",
      templatePath: path.join(context.projectRoot, "templates", "retry-report.json.tpl"),
      outputPath: path.join(context.projectRoot, "retry-report.json"),
      variables: {
        maxAttempts: String(state.maxAttempts),
        backoffMs: String(state.backoffMs),
        shouldRetry: String(state.shouldRetry),
      },
    }]);

    context.metadata = {
      ...context.metadata,
      retryPolicy: state,
    } as typeof context.metadata & { retryPolicy?: RetryPolicyState };
  }
}
