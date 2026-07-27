import { Context, ContextParams } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { Engine } from "../core/Engine.js";
import { PluginEngine } from "../plugins/PluginEngine.js";
import { PluginManager } from "../plugins/PluginManager.js";
import { ScannerEngine } from "../scanner/ScannerEngine.js";
import { ScannerManager } from "../scanner/ScannerManager.js";
import { ScannerRegistry } from "../scanner/ScannerRegistry.js";
import { AnalyzerEngine } from "../analyzer/AnalyzerEngine.js";
import { AnalyzerManager } from "../analyzer/AnalyzerManager.js";
import { RuleEngine } from "../analyzer/RuleEngine.js";
import { RuleRegistry } from "../analyzer/RuleRegistry.js";
import { DiagnosticEngine } from "../diagnostic/DiagnosticEngine.js";
import { RootCauseEngine } from "../rootcause/RootCauseEngine.js";
import { RepairEngine } from "../planner/RepairEngine.js";
import { AutoRepairEngine } from "../autofix/AutoRepairEngine.js";
import { HealthEngine } from "../health/HealthEngine.js";
import { VerificationEngine } from "./VerificationEngine.js";
import { PlannerEngine } from "../ai/engines/PlannerEngine.js";
import { ArchitectureEngine } from "../ai/engines/ArchitectureEngine.js";
import { GenerationEngine } from "../generator/GenerationEngine.js";
import { ExecutionGraphEngine } from "../runtime/ExecutionGraphEngine.js";
import { MultiAgentCoordinatorEngine } from "../agents/MultiAgentCoordinatorEngine.js";
import { PromptCompilerEngine as FactoryPromptCompilerEngine } from "../prompt/PromptCompilerEngine.js";
import { QualityIntelligenceEngine } from "../factory/QualityIntelligenceEngine.js";
import { RepairIntelligenceEngine } from "../factory/RepairIntelligenceEngine.js";
import { ReleaseIntelligenceEngine } from "../factory/ReleaseIntelligenceEngine.js";
import { FactoryDashboardEngine } from "../factory/FactoryDashboardEngine.js";
import { ProjectReasonerEngine, IntentAnalyzerEngine, DomainAnalyzerEngine, FeaturePlannerEngine, ConstraintAnalyzerEngine, ArchitectureReasonerEngine, TaskBreakdownEngine, PromptCompilerEngine, ReflectionEngine, CriticEngine, ConfidenceEngine } from "../ai/engines/ReasoningBrainEngines.js";
import { DatabaseGenerator } from "../ai/engines/DatabaseGenerator.js";
import { BackendGenerator } from "../ai/engines/BackendGenerator.js";
import { FrontendGenerator } from "../ai/engines/FrontendGenerator.js";
import { TestingGenerator } from "../ai/engines/TestingGenerator.js";
import { AuthenticationGenerator } from "../ai/engines/AuthenticationGenerator.js";
import { OpenApiGenerator } from "../ai/engines/OpenApiGenerator.js";
import { DockerGenerator } from "../ai/engines/DockerGenerator.js";
import { DeploymentGenerator } from "../ai/engines/DeploymentGenerator.js";
import { DocumentationGenerator } from "../ai/engines/DocumentationGenerator.js";
import { WorkflowEngine } from "../ai/engines/WorkflowEngine.js";
import { OrchestratorEngine } from "../ai/engines/OrchestratorEngine.js";
import { ReporterEngine } from "../report/ReporterEngine.js";
import { ReporterManager } from "../report/ReporterManager.js";
import { ReporterRegistry } from "../report/ReporterRegistry.js";
import { HistoryEngine } from "../history/HistoryEngine.js";
import { DoctorOrchestrator } from "./DoctorOrchestrator.js";
import { FactoryRuntime } from "./FactoryRuntime.js";
import { RepairCoordinator } from "./RepairCoordinator.js";
import { DashboardRuntime } from "./DashboardRuntime.js";
import { EventBus } from "./EventBus.js";
import { BuildLoopEngine } from "./BuildLoopEngine.js";
import { FailureClassifierEngine } from "./FailureClassifierEngine.js";
import { RepairDecisionEngine } from "./RepairDecisionEngine.js";
import { PatchGeneratorEngine } from "./PatchGeneratorEngine.js";
import { PatchValidatorEngine } from "./PatchValidatorEngine.js";
import { RetryPolicyEngine } from "./RetryPolicyEngine.js";
import { RepairMemoryEngine } from "./RepairMemoryEngine.js";
import { KnowledgeGraphEngine } from "./KnowledgeGraphEngine.js";
import { SemanticRetrieverEngine } from "./SemanticRetrieverEngine.js";
import { KnowledgePrunerEngine } from "./KnowledgePrunerEngine.js";
import { KnowledgeMetricsEngine } from "./KnowledgeMetricsEngine.js";
import { BenchmarkEngine } from "../benchmark/BenchmarkEngine.js";
import { ProjectEvaluator } from "../benchmark/ProjectEvaluator.js";
import { CompileEvaluator } from "../benchmark/CompileEvaluator.js";
import { QualityScoreEngine } from "../benchmark/QualityScoreEngine.js";
import { RegressionAnalyzer } from "../benchmark/RegressionAnalyzer.js";
import { ReleaseEvaluator } from "../benchmark/ReleaseEvaluator.js";
import { TrendAnalyzer } from "../benchmark/TrendAnalyzer.js";
import { ProductionValidator } from "../validation/ProductionValidator.js";
import { AgentPlanner } from "../agent/AgentPlanner.js";
import { AgentCoordinator } from "../agent/AgentCoordinator.js";
import { AgentOrchestrationEngine } from "../agent/AgentOrchestrationEngine.js";
import { SwarmCoordinatorEngine } from "../swarm/SwarmCoordinatorEngine.js";
import { SelfEvolutionEngine } from "../selfevolution/SelfEvolutionEngine.js";
import { AutonomousOrchestrator } from "../runtime/AutonomousOrchestrator.js";
import { AgentMeshEngine } from "../agents/AgentMeshEngine.js";

export interface DoctorOptions {
  scannerRegistry?: ScannerRegistry;
  ruleRegistry?: RuleRegistry;
  reporterRegistry?: ReporterRegistry;
  analyzerManager?: AnalyzerManager;
  skipBenchmark?: boolean;
}

export interface DoctorRunMetrics {
  stageDurationsMs: Record<string, number>;
  totalDurationMs: number;
  memoryBefore: NodeJS.MemoryUsage;
  memoryAfter: NodeJS.MemoryUsage;
}

export class Doctor {
  private readonly pipeline: IEngine[];
  private readonly params: ContextParams;
  private readonly options: DoctorOptions;

  constructor(params: ContextParams, options: DoctorOptions = {}) {
    this.params = params;
    this.options = options;
    const engine = new Engine(params);

    const pluginManager = new PluginManager();
    const pluginEngine = new PluginEngine(pluginManager, { eventBus: new EventBus() });

    const scannerManager = new ScannerManager();
    (options.scannerRegistry ?? new ScannerRegistry()).registerDefaults(scannerManager);
    const scannerEngine = new ScannerEngine(scannerManager);

    const ruleEngine = new RuleEngine();
    (options.ruleRegistry ?? new RuleRegistry()).registerDefaults(ruleEngine);

    const analyzerManager = options.analyzerManager ?? new AnalyzerManager();
    const analyzerEngine = new AnalyzerEngine(analyzerManager);

    const diagnosticEngine = new DiagnosticEngine();
    const rootCauseEngine = new RootCauseEngine();
    const repairEngine = new RepairEngine();
    const autoRepairEngine = new AutoRepairEngine();
    const projectReasonerEngine = new ProjectReasonerEngine();
    const intentAnalyzerEngine = new IntentAnalyzerEngine();
    const domainAnalyzerEngine = new DomainAnalyzerEngine();
    const featurePlannerEngine = new FeaturePlannerEngine();
    const constraintAnalyzerEngine = new ConstraintAnalyzerEngine();
    const architectureReasonerEngine = new ArchitectureReasonerEngine();
    const taskBreakdownEngine = new TaskBreakdownEngine();
    const reasoningPromptCompilerEngine = new PromptCompilerEngine();
    const reflectionEngine = new ReflectionEngine();
    const criticEngine = new CriticEngine();
    const confidenceEngine = new ConfidenceEngine();
    const plannerEngine = new PlannerEngine();
    const architectureEngine = new ArchitectureEngine();
    const executionGraphEngine = new ExecutionGraphEngine();
    const multiAgentCoordinatorEngine = new MultiAgentCoordinatorEngine();
    const promptCompilerEngine = new FactoryPromptCompilerEngine();
    const generationEngine = new GenerationEngine();
    const qualityIntelligenceEngine = new QualityIntelligenceEngine();
    const repairIntelligenceEngine = new RepairIntelligenceEngine();
    const releaseIntelligenceEngine = new ReleaseIntelligenceEngine();
    const factoryDashboardEngine = new FactoryDashboardEngine();
    const databaseGenerator = new DatabaseGenerator();
    const backendGenerator = new BackendGenerator();
    const frontendGenerator = new FrontendGenerator();
    const testingGenerator = new TestingGenerator();
    const authenticationGenerator = new AuthenticationGenerator();
    const openApiGenerator = new OpenApiGenerator();
    const dockerGenerator = new DockerGenerator();
    const deploymentGenerator = new DeploymentGenerator();
    const documentationGenerator = new DocumentationGenerator();
    const workflowEngine = new WorkflowEngine();
    const orchestratorEngine = new OrchestratorEngine();
    const healthEngine = new HealthEngine();
    const verificationEngine = new VerificationEngine();
    const buildLoopEngine = new BuildLoopEngine();
    const failureClassifierEngine = new FailureClassifierEngine();
    const repairDecisionEngine = new RepairDecisionEngine();
    const patchGeneratorEngine = new PatchGeneratorEngine();
    const patchValidatorEngine = new PatchValidatorEngine();
    const retryPolicyEngine = new RetryPolicyEngine();
    const repairMemoryEngine = new RepairMemoryEngine();
    const knowledgeGraphEngine = new KnowledgeGraphEngine();
    const semanticRetrieverEngine = new SemanticRetrieverEngine();
    const knowledgePrunerEngine = new KnowledgePrunerEngine();
    const knowledgeMetricsEngine = new KnowledgeMetricsEngine();
    const agentPlanner = new AgentPlanner(this.params.projectRoot);
    const agentCoordinator = new AgentCoordinator(this.params.projectRoot, agentPlanner);
    const agentOrchestrationEngine = new AgentOrchestrationEngine(agentCoordinator);
    const swarmCoordinatorEngine = new SwarmCoordinatorEngine();
    const selfEvolutionEngine = new SelfEvolutionEngine();

    const reporterManager = new ReporterManager();
    (options.reporterRegistry ?? new ReporterRegistry()).registerDefaults(reporterManager);
    const reporterEngine = new ReporterEngine(reporterManager);
    const historyEngine = new HistoryEngine(this.params.projectRoot);
    const orchestrator = new DoctorOrchestrator();
    const autonomousOrchestrator = new AutonomousOrchestrator();
    const agentMeshEngine = new AgentMeshEngine(autonomousOrchestrator);
    const repairCoordinator = new RepairCoordinator(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, historyEngine);

    const resolvedPipeline = [
      engine,
      pluginEngine,
      scannerEngine,
      ruleEngine,
      analyzerEngine,
      diagnosticEngine,
      rootCauseEngine,
      repairEngine,
      autoRepairEngine,
      projectReasonerEngine,
      intentAnalyzerEngine,
      domainAnalyzerEngine,
      featurePlannerEngine,
      constraintAnalyzerEngine,
      architectureReasonerEngine,
      taskBreakdownEngine,
      reasoningPromptCompilerEngine,
      reflectionEngine,
      criticEngine,
      confidenceEngine,
      plannerEngine,
      architectureEngine,
      executionGraphEngine,
      multiAgentCoordinatorEngine,
      promptCompilerEngine,
      generationEngine,
      qualityIntelligenceEngine,
      repairIntelligenceEngine,
      releaseIntelligenceEngine,
      factoryDashboardEngine,
      databaseGenerator,
      backendGenerator,
      frontendGenerator,
      testingGenerator,
      authenticationGenerator,
      openApiGenerator,
      dockerGenerator,
      deploymentGenerator,
      documentationGenerator,
      workflowEngine,
      orchestratorEngine,
      orchestrator,
      autonomousOrchestrator as unknown as IEngine,
      agentMeshEngine,
      repairCoordinator,
      buildLoopEngine,
      failureClassifierEngine,
      repairDecisionEngine,
      patchGeneratorEngine,
      patchValidatorEngine,
      retryPolicyEngine,
      repairMemoryEngine,
      knowledgeGraphEngine,
      semanticRetrieverEngine,
      knowledgePrunerEngine,
      knowledgeMetricsEngine,
      swarmCoordinatorEngine,
      selfEvolutionEngine,
      agentOrchestrationEngine,
      healthEngine,
      verificationEngine,
      reporterEngine,
    ];

    this.pipeline = resolvedPipeline;
    this.historyEngine = historyEngine;
    this.pluginEngine = pluginEngine;
  }

  private readonly historyEngine: HistoryEngine;
  private readonly pluginEngine: PluginEngine;

  async run(): Promise<Context> {
    return (await this.runWithMetrics()).context;
  }

  async runWithMetrics(): Promise<{ context: Context; metrics: DoctorRunMetrics }> {
    const context = new Context(this.params);
    const start = Date.now();
    const stageDurationsMs: Record<string, number> = {};
    const memoryBefore = process.memoryUsage();

    await this.pluginEngine.loadPlugins(this.params.projectRoot, context);

    const runtime = new FactoryRuntime(context, { engines: this.pipeline });
    await runtime.run();

    if (!this.options.skipBenchmark) {
      try {
        const benchmarkEngine = new BenchmarkEngine();
        await benchmarkEngine.run(context);
        const projectEvaluator = new ProjectEvaluator();
        await projectEvaluator.run(context);
        const compileEvaluator = new CompileEvaluator();
        await compileEvaluator.run(context);
        const qualityScoreEngine = new QualityScoreEngine();
        await qualityScoreEngine.run(context);
        const regressionAnalyzer = new RegressionAnalyzer();
        await regressionAnalyzer.run(context);
        const releaseEvaluator = new ReleaseEvaluator();
        await releaseEvaluator.run(context);
        const trendAnalyzer = new TrendAnalyzer();
        await trendAnalyzer.run(context);
        const productionValidator = new ProductionValidator();
        await productionValidator.run(context);

        const eventBus = new EventBus();
        const dashboardRuntime = new DashboardRuntime(context, eventBus);
        eventBus.emit({ type: "EngineFinished", timestamp: new Date().toISOString(), engine: "Doctor" });
        context.metadata = {
          ...context.metadata,
          dashboardSnapshot: dashboardRuntime.getSnapshot(),
        } as typeof context.metadata & { dashboardSnapshot?: unknown };
      } catch (error) {
        context.metadata = {
          ...context.metadata,
          benchmarkError: error instanceof Error ? error.message : String(error),
        } as typeof context.metadata & { benchmarkError?: string };
      }
    }

    const historyStart = Date.now();
    try {
      this.historyEngine.save(context, Date.now() - start);
    } catch {
      // history save is best-effort and should not block doctor execution
    }
    stageDurationsMs.History = Date.now() - historyStart;

    const memoryAfter = process.memoryUsage();
    return {
      context,
      metrics: {
        stageDurationsMs,
        totalDurationMs: Date.now() - start,
        memoryBefore,
        memoryAfter,
      },
    };
  }

  private getStageLabel(engineName: string): string {
    switch (engineName) {
      case "ScannerEngine":
        return "Scanner";
      case "RuleEngine":
        return "Analyzer";
      case "DiagnosticEngine":
        return "Diagnosis";
      case "RootCauseEngine":
        return "Root Cause";
      case "RepairEngine":
        return "Repair Planner";
      case "AutoRepairEngine":
        return "Auto Repair";
      case "PlannerEngine":
        return "Planning";
      case "ArchitectureEngine":
        return "Architecture";
      case "DatabaseGenerator":
        return "Database";
      case "BackendGenerator":
        return "Backend";
      case "FrontendGenerator":
        return "Frontend";
      case "TestingGenerator":
        return "Testing";
      case "DockerGenerator":
        return "Docker";
      case "DeploymentGenerator":
        return "Deployment";
      case "DocumentationGenerator":
        return "Documentation";
      case "WorkflowEngine":
        return "Workflow";
      case "OrchestratorEngine":
        return "Orchestration";
      case "DoctorOrchestrator":
        return "Autonomous Orchestration";
      case "VerificationEngine":
        return "Verification";
      case "BuildLoopEngine":
        return "Build Loop";
      case "FailureClassifierEngine":
        return "Failure Classification";
      case "RepairDecisionEngine":
        return "Repair Decision";
      case "PatchGeneratorEngine":
        return "Patch Generation";
      case "PatchValidatorEngine":
        return "Patch Validation";
      case "RetryPolicyEngine":
        return "Retry Policy";
      case "RepairMemoryEngine":
        return "Repair Memory";
      case "KnowledgeGraphEngine":
        return "Knowledge Graph";
      case "SemanticRetrieverEngine":
        return "Semantic Retrieval";
      case "KnowledgePrunerEngine":
        return "Knowledge Pruning";
      case "KnowledgeMetricsEngine":
        return "Knowledge Metrics";
      case "BenchmarkEngine":
        return "Benchmark";
      case "ProjectEvaluator":
        return "Project Evaluation";
      case "CompileEvaluator":
        return "Compile Evaluation";
      case "QualityScoreEngine":
        return "Quality Scoring";
      case "RegressionAnalyzer":
        return "Regression Analysis";
      case "ReleaseEvaluator":
        return "Release Evaluation";
      case "TrendAnalyzer":
        return "Trend Analysis";
      case "ProductionValidator":
        return "Production Validation";
      case "ReporterEngine":
        return "Reporter";
      default:
        return engineName;
    }
  }
}
