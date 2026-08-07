import { DependencyResolver } from "../core/DependencyResolver.js";
import { PipelineBuilder } from "../core/PipelineBuilder.js";
import { BasePlugin } from "../sdk/BasePlugin.js";
import { GenerateCommand, GeneratedArtifact, GeneratorContextLike, GeneratorPlugin } from "../sdk/contracts.js";
import { FileSystem } from "../utils/FileSystem.js";
import { path } from "../utils/Node.js";

export interface SolutionOrchestrationResult {
  artifacts: GeneratedArtifact[];
  executionPlan: string[];
  pipeline: string[];
  pluginOrder: string[];
  skippedPlugins: string[];
}

export default class SolutionPlugin extends BasePlugin {
  private readonly dependencyResolver = new DependencyResolver();
  private readonly fileSystem = new FileSystem();
  private readonly pipelineBuilder = new PipelineBuilder();

  constructor() {
    super({
      capabilities: ["solution-plan"],
      dependencies: [],
      description: "Plan-only solution plugin that contributes execution-plan capability.",
      name: "SolutionPlugin",
      priority: 10,
      targets: ["module"],
      version: "1.0.0"
    });
  }

  dependencies(): readonly string[] {
    return [];
  }

  async generate(context: GeneratorContextLike): Promise<GeneratedArtifact[]> {
    void context;
    return [];
  }

  async orchestrate(
    command: GenerateCommand,
    plugins: readonly GeneratorPlugin[],
    runPlugin: (plugin: GeneratorPlugin) => Promise<GeneratedArtifact[]>
  ): Promise<SolutionOrchestrationResult> {
    const executionPlan = this.readExecutionPlan(command);
    const availablePlugins = plugins.filter((plugin) => plugin.manifest.name !== this.manifest.name);
    const pluginMap = new Map(availablePlugins.map((plugin) => [plugin.manifest.name, plugin]));
    const skippedPlugins: string[] = [];

    const preferredPluginNames: string[] = [
      "RequirementArchitectPlugin",
      "IdentityGeneratorPlugin",
      "CrudPlugin",
      "SeedPlugin",
      "TestGenerator",
      "DocumentationPlugin"
    ];

    const requestedPluginNames: string[] = [];

    for (const pluginName of preferredPluginNames) {
      if (pluginMap.has(pluginName)) {
        requestedPluginNames.push(pluginName);
        continue;
      }

      skippedPlugins.push(pluginName);
    }

    for (const plugin of availablePlugins) {
      if (!requestedPluginNames.includes(plugin.manifest.name)) {
        requestedPluginNames.push(plugin.manifest.name);
      }
    }

    const uniqueRequestedPluginNames = Array.from(new Set(requestedPluginNames));
    const orderedPlugins = this.dependencyResolver.resolve(uniqueRequestedPluginNames, availablePlugins);
    const pipeline = this.pipelineBuilder.build(orderedPlugins.map((plugin) => plugin.manifest.name), {
      entityPlans: [],
      stages: []
    });

    const artifacts: GeneratedArtifact[] = [];
    const pluginOrder: string[] = [];

    for (const stage of pipeline.stages) {
      const plugin = orderedPlugins.find((item) => item.manifest.name === stage.name);
      if (!plugin) {
        continue;
      }

      if (pluginOrder.includes(plugin.manifest.name)) {
        continue;
      }

      const pluginArtifacts = await runPlugin(plugin);
      artifacts.push(...pluginArtifacts);
      pluginOrder.push(plugin.manifest.name);
    }

    return {
      artifacts,
      executionPlan,
      pipeline: pipeline.stages.map((stage) => stage.name),
      pluginOrder,
      skippedPlugins
    };
  }

  private readExecutionPlan(command: GenerateCommand): string[] {
    const wisataFallback = ["Identity", "Dashboard", "Master Data", "Wisata", "Reservasi", "Ticketing", "Pembayaran", "Laporan", "Dokumentasi"];
    const defaultFallback = ["Identity", "Dashboard", "Master", "Transaction", "Report", "Settings"];
    if (!command.blueprintPath) {
      return /wisata/i.test(command.name) ? wisataFallback : defaultFallback;
    }

    const filePath = path.resolve(command.blueprintPath);
    if (!this.fileSystem.exists(filePath)) {
      return /wisata/i.test(command.name) ? wisataFallback : defaultFallback;
    }

    const content = this.fileSystem.readText(filePath);
    const lines = content.split(/\r?\n/).map((line) => line.trim());
    const modules: string[] = [];
    let inModules = false;

    for (const line of lines) {
      if (line.length === 0) {
        continue;
      }

      if (line.toLowerCase() === "modules:") {
        inModules = true;
        continue;
      }

      if (inModules) {
        modules.push(line);
      }
    }

    return modules.length > 0 ? modules : (/wisata/i.test(command.name) ? wisataFallback : defaultFallback);
  }
}
