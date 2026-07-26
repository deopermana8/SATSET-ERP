import type { Context } from "../core/Context.js";
import { CompileEngine } from "../ai/engines/CompileEngine.js";
import { TestEngine } from "../ai/engines/TestEngine.js";
import { CompileResultParser, type CompileResult } from "./CompileResult.js";
import { ErrorClassifier } from "./ErrorClassifier.js";
import { PatchPlanner } from "./PatchPlanner.js";
import { PatchGenerator } from "./PatchGenerator.js";
import { PatchApplier } from "./PatchApplier.js";
import { DefaultRetryPolicy } from "./RetryPolicy.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";
import path from "node:path";
import type { HistoryEngine } from "../history/HistoryEngine.js";
import type { CheckpointManager } from "./CheckpointManager.js";
import type { DashboardRuntime } from "./DashboardRuntime.js";
import type { EventBus } from "./EventBus.js";
import { BuildVerifier } from "./BuildVerifier.js";

export interface RepairIteration {
  attempt: number;
  compile: CompileResult;
  classifiedErrors: ReturnType<ErrorClassifier["classify"]>;
  patchPlans: ReturnType<PatchPlanner["plan"]>;
  patchResults: Awaited<ReturnType<PatchApplier["apply"]>>;
  status: "passed" | "failed";
}

export class RepairCoordinator {
  public readonly name = "RepairCoordinator";

  constructor(
    private readonly compileEngine: CompileEngine = new CompileEngine(),
    private readonly testEngine: TestEngine = new TestEngine(),
    private readonly errorClassifier: ErrorClassifier = new ErrorClassifier(),
    private readonly patchPlanner: PatchPlanner = new PatchPlanner(),
    private readonly patchGenerator: PatchGenerator = new PatchGenerator(),
    private readonly patchApplier: PatchApplier = new PatchApplier(),
    private readonly buildVerifier: BuildVerifier = new BuildVerifier(),
    private readonly retryPolicy: DefaultRetryPolicy = new DefaultRetryPolicy(),
    private readonly historyEngine?: HistoryEngine,
    private readonly checkpointManager?: CheckpointManager,
    private readonly dashboardRuntime?: DashboardRuntime,
    private readonly eventBus?: EventBus
  ) {}

  async run(context: Context): Promise<void> {
    const iterations: RepairIteration[] = [];
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "repair-coordinator",
      name: "repair-coordinator",
      templatePath: path.join(context.projectRoot, "templates", "repair-progress.json.tpl"),
      outputPath: path.join(context.projectRoot, ".progress.json"),
      variables: {
        currentStage: "repair",
        progress: "60",
        currentTask: "repairing compile and test failures",
        estimatedRemaining: "20s",
      },
    }]);

    for (let attempt = 1; attempt <= this.retryPolicy.maxAttempts; attempt += 1) {
      const compileResult = await this.runCompile(context);
      const diagnostics = compileResult.diagnostics;
      const classifiedErrors = this.errorClassifier.classify(diagnostics);
      const patchPlans = this.patchPlanner.plan(diagnostics);
      const generatedPatches = await this.patchGenerator.generate(patchPlans, classifiedErrors, context.projectRoot);
      const patchResults = await this.patchApplier.apply(generatedPatches, context.projectRoot);
      await this.testEngine.run(context);
      const verificationResult = await this.buildVerifier.verify(context, compileResult);
      const status = verificationResult.compilePassed && verificationResult.testsPassed && verificationResult.verificationPassed ? "passed" : "failed";
      iterations.push({ attempt, compile: compileResult, classifiedErrors, patchPlans, patchResults, status });

      context.metadata = {
        ...context.metadata,
        repairIterations: iterations,
      } as typeof context.metadata & { repairIterations?: RepairIteration[] };

      this.historyEngine?.save(context, 0);
      await this.checkpointManager?.save(context, [], "repair");
      this.dashboardRuntime?.getSnapshot();
      this.eventBus?.emit({ type: "RepairIterationCompleted", timestamp: new Date().toISOString(), stage: "Repair", details: { attempt, status } });

      if (status === "passed") {
        break;
      }
    }
  }

  private async runCompile(context: Context): Promise<CompileResult> {
    await this.compileEngine.run(context);
    const compileState = context.metadata?.compile as { diagnostics?: string[]; exitCode?: number | null; stdout?: string; stderr?: string } | undefined;
    const stdout = compileState?.stdout ?? "";
    const stderr = compileState?.stderr ?? "";
    const diagnosticsText = [...(compileState?.diagnostics ?? []), stdout, stderr].join("\n");
    const diagnostics = CompileResultParser.parse(diagnosticsText);
    const succeeded = (compileState?.exitCode ?? 0) === 0 && diagnostics.filter((diagnostic) => diagnostic.severity === "error").length === 0;
    return {
      succeeded,
      exitCode: compileState?.exitCode ?? null,
      stdout,
      stderr,
      diagnostics,
      errorCount: diagnostics.filter((diagnostic) => diagnostic.severity === "error").length,
      warningCount: diagnostics.filter((diagnostic) => diagnostic.severity === "warning").length,
      infoCount: diagnostics.filter((diagnostic) => diagnostic.severity === "info").length,
    };
  }
}
