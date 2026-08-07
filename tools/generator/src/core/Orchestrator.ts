import { CommandTarget, GenerateCommand, GeneratorRunResult, GeneratorPlugin, KnowledgeRegistryReport, NormalizedBlueprint, ProjectModel } from "../sdk/contracts.js";
import { ApiDesigner } from "./ApiDesigner.js";
import { BusinessRuleEngine } from "./BusinessRuleEngine.js";
import { Composer } from "./Composer.js";
import { Context } from "./Context.js";
import { DatabaseDesigner } from "./DatabaseDesigner.js";
import { DependencyResolver } from "./DependencyResolver.js";
import { FactoryPipelineExecutor } from "./FactoryPipelineExecutor.js";
import { KnowledgeRegistry } from "./KnowledgeRegistry.js";
import { PipelineBuilder } from "./PipelineBuilder.js";
import { PipelineContextFactory } from "./PipelineContextFactory.js";
import { Planner } from "./Planner.js";
import { PluginEngine } from "./PluginEngine.js";
import { PostProcessor } from "./PostProcessor.js";
import { ProjectAnalyzer } from "./ProjectAnalyzer.js";
import { RefactorEngine } from "./RefactorEngine.js";
import { UIDesigner } from "./UIDesigner.js";
import { Logger } from "./Logger.js";
import { TemplateEngine } from "./TemplateEngine.js";
import { WorkflowEngine } from "./WorkflowEngine.js";
import SolutionPlugin, { SolutionOrchestrationResult } from "../plugins/SolutionPlugin.js";

export interface OrchestratorResult {
  automation: string[];
  blueprint: NormalizedBlueprint;
  executionPlan?: string[];
  knowledge: KnowledgeRegistryReport;
  pipeline: string[];
  projectModel: ProjectModel;
  result: GeneratorRunResult;
  skippedPlugins?: string[];
}

export interface IOrchestrator {
  run(command: GenerateCommand, blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[], options: {
    generatorRoot: string;
    outputRoot: string;
    projectRoot: string;
  }): Promise<OrchestratorResult>;
}

export class Orchestrator implements IOrchestrator {
  private readonly apiDesigner = new ApiDesigner();
  private readonly businessRuleEngine = new BusinessRuleEngine();
  private readonly composer = new Composer();
  private readonly databaseDesigner = new DatabaseDesigner();
  private readonly dependencyResolver = new DependencyResolver();
  private readonly factoryPipelineExecutor = new FactoryPipelineExecutor();
  private readonly knowledgeRegistry = new KnowledgeRegistry();
  private readonly pipelineBuilder = new PipelineBuilder();
  private readonly pipelineContextFactory = new PipelineContextFactory();
  private readonly planner = new Planner();
  private readonly pluginEngine = new PluginEngine();
  private readonly postProcessor = new PostProcessor();
  private readonly projectAnalyzer = new ProjectAnalyzer();
  private readonly refactorEngine = new RefactorEngine();
  private readonly templateEngine = new TemplateEngine();
  private readonly uiDesigner = new UIDesigner();
  private readonly workflowEngine = new WorkflowEngine();

  async run(command: GenerateCommand, blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[], options: {
    generatorRoot: string;
    outputRoot: string;
    projectRoot: string;
  }): Promise<OrchestratorResult> {
    if (command.verb === "solution") {
      const solutionPlugin = plugins.find((plugin) => plugin.manifest.name === "SolutionPlugin");
      if (!solutionPlugin || !(solutionPlugin instanceof SolutionPlugin)) {
        throw new Error("SolutionPlugin is not registered.");
      }

      const entityPlans = this.planner.plan(blueprint, plugins);
      const logger = new Logger(options.generatorRoot);
      const solutionResult: SolutionOrchestrationResult = await solutionPlugin.orchestrate(command, plugins, async (plugin) => {
        const pluginArtifacts: GeneratorRunResult["artifacts"] = [];

        for (const entityPlan of entityPlans) {
          const context: Context = this.pipelineContextFactory.create({
            command,
            entityPlan,
            generatorRoot: options.generatorRoot,
            logger,
            outputRoot: options.outputRoot,
            projectRoot: options.projectRoot,
            templateEngine: this.templateEngine
          });
          const result = await this.pluginEngine.execute(context, [plugin]);
          pluginArtifacts.push(...result.artifacts);
          await this.postProcessor.process(context, result);
        }

        return pluginArtifacts;
      });

      const analyzed = await this.projectAnalyzer.analyze(options.projectRoot, plugins);
      const refactoredModel = await this.refactorEngine.run(analyzed, plugins);

      return {
        automation: [],
        blueprint,
        executionPlan: solutionResult.executionPlan,
        knowledge: await this.knowledgeRegistry.build(plugins),
        pipeline: solutionResult.pipeline,
        projectModel: refactoredModel,
        result: {
          artifacts: solutionResult.artifacts,
          pluginOrder: solutionResult.pluginOrder
        },
        skippedPlugins: solutionResult.skippedPlugins
      };
    }

    const knowledge = await this.knowledgeRegistry.build(plugins);
    let currentBlueprint = await this.workflowEngine.design(blueprint, plugins);
    currentBlueprint = await this.databaseDesigner.design(currentBlueprint, plugins);
    currentBlueprint = await this.apiDesigner.design(currentBlueprint, plugins);
    currentBlueprint = await this.uiDesigner.design(currentBlueprint, plugins);
    const businessRules = await this.businessRuleEngine.collect(currentBlueprint, plugins);
    currentBlueprint = {
      ...currentBlueprint,
      metadata: {
        ...currentBlueprint.metadata,
        businessRules: businessRules.map((rule) => rule.name).join(",")
      }
    };
    const requestedPluginNames = this.composer.compose(command.target as Exclude<CommandTarget, "plugin" | "blueprint">, currentBlueprint, plugins);
    const orderedPlugins = this.dependencyResolver.resolve(requestedPluginNames, plugins);
    const entityPlans = this.planner.plan(currentBlueprint, orderedPlugins);
    const pipeline = this.pipelineBuilder.build(orderedPlugins.map((plugin) => plugin.manifest.name), {
      entityPlans,
      stages: []
    });
    const logger = new Logger(options.generatorRoot);
    const aggregated: GeneratorRunResult = {
      artifacts: [],
      pluginOrder: orderedPlugins.map((plugin) => plugin.manifest.name)
    };

    for (const entityPlan of entityPlans) {
      const context: Context = this.pipelineContextFactory.create({
        command,
        entityPlan,
        generatorRoot: options.generatorRoot,
        logger,
        outputRoot: options.outputRoot,
        projectRoot: options.projectRoot,
        templateEngine: this.templateEngine
      });
      const result = await this.pluginEngine.execute(context, orderedPlugins);
      aggregated.artifacts.push(...result.artifacts);
      await this.postProcessor.process(context, result);
    }

    const analyzed = await this.projectAnalyzer.analyze(options.projectRoot, plugins);
    const refactoredModel = await this.refactorEngine.run(analyzed, plugins);
    const automation = await this.factoryPipelineExecutor.run(options.projectRoot);

    return {
      automation: automation.map((item) => `${item.command}:${item.success ? "ok" : "fail"}`),
      blueprint: currentBlueprint,
      knowledge,
      pipeline: pipeline.stages.map((stage) => `${stage.name}: ${stage.pluginNames.join(", ")}`),
      projectModel: refactoredModel,
      result: aggregated
    };
  }
}
