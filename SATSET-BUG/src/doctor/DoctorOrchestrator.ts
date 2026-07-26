import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { AIRequirementEngine } from "../ai/engines/AIRequirementEngine.js";
import { ReasoningEngine } from "../reasoning/ReasoningEngine.js";
import { ArchitectureBuilder } from "../ai/engines/ArchitectureBuilder.js";
import { ProjectScaffolder } from "../ai/engines/ProjectScaffolder.js";
import { BuildEngine } from "../ai/engines/BuildEngine.js";
import { CompileEngine } from "../ai/engines/CompileEngine.js";
import { TestEngine } from "../ai/engines/TestEngine.js";
import { BackendGenerator } from "../ai/engines/BackendGenerator.js";
import { FrontendGenerator } from "../ai/engines/FrontendGenerator.js";
import { DatabaseGenerator } from "../ai/engines/DatabaseGenerator.js";
import { AuthenticationGenerator } from "../ai/engines/AuthenticationGenerator.js";
import { OpenApiGenerator } from "../ai/engines/OpenApiGenerator.js";
import { DockerGenerator } from "../ai/engines/DockerGenerator.js";
import { DeploymentGenerator } from "../ai/engines/DeploymentGenerator.js";
import { DocumentationGenerator } from "../ai/engines/DocumentationGenerator.js";
import { RepairLoopEngine } from "../ai/engines/RepairLoopEngine.js";
import { CertificationEngine } from "../ai/engines/CertificationEngine.js";
import { PackageEngine } from "../ai/engines/PackageEngine.js";
import { ReleaseEngine } from "../ai/engines/ReleaseEngine.js";
import { DeploymentPreparationEngine } from "../ai/engines/DeploymentPreparationEngine.js";
import { ProjectValidationEngine } from "../ai/engines/ProjectValidationEngine.js";
import { QualityGateEngine } from "../ai/engines/QualityGateEngine.js";
import { MetricsEngine } from "../ai/engines/MetricsEngine.js";
import { NotificationEngine } from "../ai/engines/NotificationEngine.js";
import { AuditEngine } from "../ai/engines/AuditEngine.js";
import { LearningEngine } from "../ai/engines/LearningEngine.js";
import { OptimizationEngine } from "../ai/engines/OptimizationEngine.js";
import { ProjectBrainEngine } from "../ai/engines/ProjectBrainEngine.js";
import { RequirementRefinementEngine } from "../ai/engines/RequirementRefinementEngine.js";
import { BusinessRuleEngine } from "../ai/engines/BusinessRuleEngine.js";
import { ArchitectureDecisionEngine } from "../ai/engines/ArchitectureDecisionEngine.js";
import { ModulePlannerEngine } from "../ai/engines/ModulePlannerEngine.js";
import { DependencyResolverEngine } from "../ai/engines/DependencyResolverEngine.js";
import { SourceGeneratorEngine } from "../ai/engines/SourceGeneratorEngine.js";
import { CodeAssemblerEngine } from "../ai/engines/CodeAssemblerEngine.js";
import { RefactorEngine } from "../ai/engines/RefactorEngine.js";
import { CompileMonitorEngine } from "../ai/engines/CompileMonitorEngine.js";
import { TestMonitorEngine } from "../ai/engines/TestMonitorEngine.js";
import { SelfHealingEngine } from "../ai/engines/SelfHealingEngine.js";
import { SecurityScannerEngine } from "../ai/engines/SecurityScannerEngine.js";
import { PerformanceAnalyzerEngine } from "../ai/engines/PerformanceAnalyzerEngine.js";
import { DocumentationBuilderEngine } from "../ai/engines/DocumentationBuilderEngine.js";
import { ReleaseBuilderEngine } from "../ai/engines/ReleaseBuilderEngine.js";
import { VersionManagerEngine } from "../ai/engines/VersionManagerEngine.js";
import { PackagePublisherEngine } from "../ai/engines/PackagePublisherEngine.js";
import { KnowledgeBaseEngine } from "../ai/engines/KnowledgeBaseEngine.js";
import { ExperienceEngine } from "../ai/engines/ExperienceEngine.js";
import { TaskGraphEngine } from "../orchestrator/TaskGraphEngine.js";
import { SchedulerEngine } from "../orchestrator/SchedulerEngine.js";
import { WorkerEngine } from "../orchestrator/WorkerEngine.js";
import { ProgressEngine } from "../orchestrator/ProgressEngine.js";
import { DecisionEngine } from "../orchestrator/DecisionEngine.js";
import { ResumeEngine } from "../orchestrator/ResumeEngine.js";
import { CheckpointEngine } from "../orchestrator/CheckpointEngine.js";
import { VerificationEngine } from "./VerificationEngine.js";
import { HistoryEngine } from "../history/HistoryEngine.js";
import { RepairCoordinator } from "./RepairCoordinator.js";

export class DoctorOrchestrator implements IEngine {
  public readonly name = "DoctorOrchestrator";

  async run(context: Context): Promise<void> {
    const engines = [
      new ReasoningEngine(),
      new ProjectBrainEngine(),
      new AIRequirementEngine(),
      new RequirementRefinementEngine(),
      new BusinessRuleEngine(),
      new ArchitectureBuilder(),
      new ArchitectureDecisionEngine(),
      new ModulePlannerEngine(),
      new DependencyResolverEngine(),
      new SourceGeneratorEngine(),
      new CodeAssemblerEngine(),
      new ProjectScaffolder(),
      new TaskGraphEngine(),
      new SchedulerEngine(),
      new WorkerEngine(),
      new ProgressEngine(),
      new BackendGenerator(),
      new FrontendGenerator(),
      new DatabaseGenerator(),
      new AuthenticationGenerator(),
      new OpenApiGenerator(),
      new DockerGenerator(),
      new DeploymentGenerator(),
      new DocumentationGenerator(),
      new BuildEngine(),
      new CompileEngine(),
      new CompileMonitorEngine(),
      new RepairCoordinator(),
      new RepairLoopEngine(),
      new RefactorEngine(),
      new TestEngine(),
      new TestMonitorEngine(),
      new SelfHealingEngine(),
      new DecisionEngine(),
      new ResumeEngine(),
      new CheckpointEngine(),
      new VerificationEngine(),
      new SecurityScannerEngine(),
      new PerformanceAnalyzerEngine(),
      new PackageEngine(),
      new ReleaseEngine(),
      new DeploymentPreparationEngine(),
      new ProjectValidationEngine(),
      new QualityGateEngine(),
      new MetricsEngine(),
      new NotificationEngine(),
      new AuditEngine(),
      new DocumentationBuilderEngine(),
      new ReleaseBuilderEngine(),
      new VersionManagerEngine(),
      new PackagePublisherEngine(),
      new LearningEngine(),
      new KnowledgeBaseEngine(),
      new ExperienceEngine(),
      new OptimizationEngine(),
    ];

    for (const engine of engines) {
      await engine.run(context);
    }

    const history = new HistoryEngine(context.projectRoot);
    history.save(context, 0);
    const certificateEngine = new CertificationEngine();
    await certificateEngine.run(context);
  }
}
