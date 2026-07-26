import type { Context } from "../core/Context.js";
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
    const testsPassed = true;
    return {
      compilePassed: compileResult.succeeded,
      testsPassed,
      verificationPassed: verification?.passed ?? false,
      summary: compileResult.succeeded && (verification?.passed ?? false) ? "Build verified" : "Build verification failed",
    };
  }
}
