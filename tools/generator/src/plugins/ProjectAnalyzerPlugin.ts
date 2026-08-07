import { BasePlugin } from "../sdk/BasePlugin.js";
import { GeneratedArtifact, GeneratorContextLike, GeneratorRunResult, ProjectAnalyzerContextLike, ProjectModel } from "../sdk/contracts.js";

export default class ProjectAnalyzerPlugin extends BasePlugin {
  constructor() {
    super({
      capabilities: ["analysis", "doctor"],
      dependencies: [],
      description: "Analyze workspace, generator, plugins, dependency graph, and build logs.",
      name: "ProjectAnalyzerPlugin",
      priority: 230,
      targets: ["module", "entity", "dashboard", "report", "mobile", "scanner"],
      version: "3.0.0"
    });
  }

  async analyzeProject(project: ProjectModel, context: ProjectAnalyzerContextLike): Promise<ProjectModel> {
    return {
      ...project,
      buildLogs: [...project.buildLogs, `${context.projectRoot}/tools/autofix/build.log`]
    };
  }

  async afterGenerate(context: GeneratorContextLike, result: GeneratorRunResult): Promise<void> {
    await super.afterGenerate(context as never, result);
  }

  async beforeGenerate(context: GeneratorContextLike): Promise<void> {
    await super.beforeGenerate(context as never);
  }

  dependencies(): readonly string[] {
    return [];
  }

  async generate(context: GeneratorContextLike): Promise<GeneratedArtifact[]> {
    void context;
    return [];
  }

  async validate(context: GeneratorContextLike): Promise<void> {
    await super.validate(context as never);
  }
}
