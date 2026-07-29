import type { Context } from "../core/Context.js";
import type { TestMetrics } from "../ai/engines/TestEngine.js";
import { VerificationEngine } from "./VerificationEngine.js";
import type { CompileResult } from "./CompileResult.js";

export interface BuildVerificationResult {
  compilePassed: boolean;
  testsPassed: boolean;
  verificationPassed: boolean;
  summary: string;
}

export class BuildVerifier {
  constructor(private readonly verificationEngine: VerificationEngine = new VerificationEngine()) {}

  async verify(context: Context, compileResult: CompileResult): Promise<BuildVerificationResult> {
    await this.verificationEngine.run(context);
    const verification = context.verification as { passed?: boolean } | undefined;
    const testsPassed = this.readTestsPassed(context);
    const buildPassed = compileResult.succeeded && testsPassed && (verification?.passed ?? false);
    return {
      compilePassed: compileResult.succeeded,
      testsPassed,
      verificationPassed: verification?.passed ?? false,
      summary: buildPassed ? "Build verified" : "Build verification failed",
    };
  }

  private readTestsPassed(context: Context): boolean {
    const testMetrics = (context.metadata as { test?: TestMetrics } | undefined)?.test;
    if (!testMetrics) {
      return false;
    }

    const exitCodes = [testMetrics.unitExitCode, testMetrics.integrationExitCode];
    return exitCodes.every((exitCode) => exitCode === 0);
  }
}
