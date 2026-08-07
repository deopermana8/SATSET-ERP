import { PluginScaffolder } from "../sdk/PluginScaffolder.js";
import { DoctorReport, GenerateCommand, GeneratorRunResult, RepairReport, SatsetPresetTarget } from "../sdk/contracts.js";
import { path } from "../utils/Node.js";
import { FileSystem } from "../utils/FileSystem.js";
import { ArchitectEngine } from "./ArchitectEngine.js";
import { BlueprintEngine } from "./BlueprintEngine.js";
import { DeploymentPlanner } from "./DeploymentPlanner.js";
import { Doctor } from "./Doctor.js";
import { DomainPackRegistry } from "./DomainPackRegistry.js";
import { GeneratorRegistry } from "./GeneratorRegistry.js";
import { Logger } from "./Logger.js";
import { Orchestrator } from "./Orchestrator.js";
import { PresetResolver } from "./PresetResolver.js";
import { Repair } from "./Repair.js";
import { SATSET_PRESET_TARGETS } from "./PresetCatalog.js";

export interface GeneratorCoreResult {
  artifacts: GeneratorRunResult["artifacts"];
  blueprintPath?: string;
  doctor?: DoctorReport;
  buildStatus?: string;
  executionPlan?: string[];
  pipeline?: string[];
  pluginPath?: string;
  pluginOrder: string[];
  repair?: RepairReport;
  skippedPlugins?: string[];
}

export interface IGeneratorCore {
  run(command: GenerateCommand): Promise<GeneratorCoreResult>;
}

export class GeneratorCore implements IGeneratorCore {
  private readonly architectEngine = new ArchitectEngine();
  private readonly blueprintEngine = new BlueprintEngine();
  private readonly deploymentPlanner = new DeploymentPlanner();
  private readonly doctor = new Doctor();
  private readonly domainPackRegistry = new DomainPackRegistry();
  private readonly logger: Logger;
  private readonly orchestrator = new Orchestrator();
  private readonly pluginScaffolder = new PluginScaffolder();
  private readonly presetResolver = new PresetResolver();
  private readonly repair = new Repair();
  private readonly registry: GeneratorRegistry;
  private readonly fileSystem = new FileSystem();

  constructor(private readonly projectRoot: string, private readonly generatorRoot: string) {
    this.logger = new Logger(generatorRoot);
    this.registry = new GeneratorRegistry(this.logger);
  }

  async run(command: GenerateCommand): Promise<GeneratorCoreResult> {
    const pluginRoot = this.resolvePluginRoot();
    const availablePlugins = await this.registry.discover(pluginRoot);

    if (command.verb === "doctor") {
      return this.runDoctor(pluginRoot, availablePlugins);
    }

    if (command.verb === "repair") {
      return this.runRepair(pluginRoot, availablePlugins);
    }

    if (command.verb === "build") {
      return {
        artifacts: [],
        buildStatus: "build-triggered",
        pipeline: ["AutoFix", "Doctor", "Repair", "Build"],
        pluginOrder: availablePlugins.map((plugin) => plugin.manifest.name)
      };
    }

    if (command.verb === "autofix") {
      return {
        artifacts: [],
        buildStatus: "autofix-triggered",
        pipeline: ["AutoFix"],
        pluginOrder: []
      };
    }

    if (command.verb === "solution") {
      if (!availablePlugins.some((plugin) => plugin.manifest.name === "SolutionPlugin")) {
        throw new Error("SolutionPlugin is not registered.");
      }

      const defaultBlueprintCommand: GenerateCommand = {
        ...command,
        blueprintPath: undefined,
        target: "module",
        verb: "generate"
      };
      const blueprint = this.blueprintEngine.load(defaultBlueprintCommand, this.generatorRoot);
      const orchestration = await this.orchestrator.run(command, blueprint, availablePlugins, {
        generatorRoot: this.generatorRoot,
        outputRoot: this.resolveOutputRoot(command),
        projectRoot: this.projectRoot
      });

      return {
        artifacts: orchestration.result.artifacts,
        buildStatus: "solution-executed",
        executionPlan: orchestration.executionPlan,
        pipeline: orchestration.pipeline,
        pluginOrder: orchestration.result.pluginOrder,
        skippedPlugins: orchestration.skippedPlugins
      };
    }

    if (command.target === "plugin") {
      const pluginPath = this.pluginScaffolder.scaffold({
        className: command.name,
        generatorRoot: this.generatorRoot
      });
      return {
        artifacts: [],
        pluginOrder: [],
        pluginPath
      };
    }

    if (command.target === "blueprint") {
      const blueprintType = command.blueprintType && command.blueprintType !== "workspace"
        ? command.blueprintType as "module" | "entity" | "dashboard" | "report" | "mobile" | "scanner"
        : "module";
      const blueprintPath = this.blueprintEngine.scaffold(
        this.generatorRoot,
        command.name,
        blueprintType
      );
      return {
        artifacts: [],
        blueprintPath,
        pluginOrder: []
      };
    }

    const normalizedCommand = await this.normalizeCommand(command);
    const blueprint = await this.resolveBlueprint(normalizedCommand, availablePlugins);

    if (normalizedCommand.verb === "architect") {
      return {
        artifacts: [],
        buildStatus: "architected",
        pipeline: ["Architect"],
        pluginOrder: availablePlugins.map((plugin) => plugin.manifest.name)
      };
    }

    if (normalizedCommand.verb === "compose") {
      const orchestration = await this.orchestrator.run(normalizedCommand, blueprint, availablePlugins, {
        generatorRoot: this.generatorRoot,
        outputRoot: this.resolveOutputRoot(normalizedCommand),
        projectRoot: this.projectRoot
      });
      return {
        artifacts: [],
        buildStatus: "composed",
        pipeline: orchestration.pipeline,
        pluginOrder: orchestration.result.pluginOrder
      };
    }

    if (normalizedCommand.verb === "workflow") {
      return {
        artifacts: [],
        buildStatus: blueprint.workflow.length > 0 ? "workflow-designed" : "workflow-empty",
        pipeline: blueprint.workflow.map((flow) => flow.name),
        pluginOrder: availablePlugins.map((plugin) => plugin.manifest.name)
      };
    }

    const orchestration = await this.orchestrator.run(normalizedCommand, blueprint, availablePlugins, {
      generatorRoot: this.generatorRoot,
      outputRoot: this.resolveOutputRoot(normalizedCommand),
      projectRoot: this.projectRoot
    });

    if (normalizedCommand.verb === "deploy") {
      const deployment = this.deploymentPlanner.plan(blueprint, {
        entityPlans: [],
        stages: orchestration.pipeline.map((item) => ({ name: item, pluginNames: [] }))
      });
      return {
        artifacts: [],
        buildStatus: deployment.target,
        pipeline: deployment.pipelineStages,
        pluginOrder: orchestration.result.pluginOrder
      };
    }

    return {
      artifacts: orchestration.result.artifacts,
      buildStatus: orchestration.automation.every((item) => item.endsWith(":ok")) ? "clean" : "needs-attention",
      pipeline: [...orchestration.pipeline, ...orchestration.automation],
      pluginOrder: orchestration.result.pluginOrder
    };
  }

  private resolvePluginRoot(): string {
    if (process.env.SATSET_QA_MODE === "1") {
      return path.join(this.generatorRoot, "src", "plugins");
    }

    const distPluginRoot = path.join(this.generatorRoot, "dist", "plugins");
    if (this.fileSystem.exists(distPluginRoot)) {
      return distPluginRoot;
    }

    return path.join(this.generatorRoot, "src", "plugins");
  }

  private resolveOutputRoot(command: GenerateCommand): string {
    if (command.outputDir) {
      return path.resolve(command.outputDir);
    }

    if (command.target === "workspace") {
      return this.projectRoot;
    }

    return path.join(this.generatorRoot, "output");
  }

  private async normalizeCommand(command: GenerateCommand): Promise<GenerateCommand> {
    if (SATSET_PRESET_TARGETS.includes(command.target as SatsetPresetTarget)) {
      const preset = this.presetResolver.resolve(command.target as never);
      return {
        ...command,
        blueprintType: preset.blueprintType,
        name: command.name.length > 0 ? command.name : preset.name,
        target: preset.blueprintType
      };
    }

    return command as GenerateCommand;
  }

  private async resolveBlueprint(command: GenerateCommand, plugins: Awaited<ReturnType<GeneratorRegistry["discover"]>>) {
    if (["create", "architect"].includes(command.verb)) {
      const packs = await this.domainPackRegistry.discover(this.generatorRoot);
      const matchedPack = this.domainPackRegistry.findByRequirement(command.name, packs);
      if (matchedPack) {
        return this.blueprintEngine.load({
          ...command,
          blueprintPath: matchedPack.filePath,
          target: "module",
          verb: "generate"
        }, this.generatorRoot);
      }

      return this.architectEngine.architect(command, plugins, this.projectRoot, this.generatorRoot);
    }

    return this.blueprintEngine.load(command, this.generatorRoot);
  }

  private async runDoctor(pluginRoot: string, plugins: Awaited<ReturnType<GeneratorRegistry["discover"]>>): Promise<GeneratorCoreResult> {
    const doctor = await this.doctor.run({
      buildLogPath: path.join(this.projectRoot, "tools", "autofix", "build.log"),
      generatorRoot: this.generatorRoot,
      pluginRoot,
      plugins,
      projectRoot: this.projectRoot
    });
    return {
      artifacts: [],
      buildStatus: doctor.ok ? "clean" : "issues-found",
      doctor,
      pipeline: [],
      pluginOrder: plugins.map((plugin) => plugin.manifest.name)
    };
  }

  private async runRepair(pluginRoot: string, plugins: Awaited<ReturnType<GeneratorRegistry["discover"]>>): Promise<GeneratorCoreResult> {
    const repair = await this.repair.run({
      build: async () => {
        const doctor = await this.doctor.run({
          buildLogPath: path.join(this.projectRoot, "tools", "autofix", "build.log"),
          generatorRoot: this.generatorRoot,
          pluginRoot,
          plugins,
          projectRoot: this.projectRoot
        });
        return doctor.ok;
      },
      buildLogPath: path.join(this.projectRoot, "tools", "autofix", "build.log"),
      generatorRoot: this.generatorRoot,
      pluginRoot,
      plugins,
      projectRoot: this.projectRoot
    });
    return {
      artifacts: [],
      buildStatus: repair.buildStatus,
      pipeline: ["Doctor", "AutoFix", "Build"],
      pluginOrder: plugins.map((plugin) => plugin.manifest.name),
      repair
    };
  }
}
