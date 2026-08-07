import { BasePlugin } from "../sdk/BasePlugin.js";
import { GeneratedArtifact, GeneratorContextLike, GeneratorRunResult, ProjectModel } from "../sdk/contracts.js";

export default class RefactorPlugin extends BasePlugin {
  constructor() {
    super({
      capabilities: ["refactor", "repair"],
      dependencies: ["ProjectAnalyzerPlugin"],
      description: "Produce refactor plan to reduce duplicate code and normalize structure.",
      name: "RefactorPlugin",
      priority: 235,
      targets: ["module", "entity", "dashboard", "report", "mobile", "scanner"],
      version: "3.0.0"
    });
  }

  async refactorProject(project: ProjectModel): Promise<ProjectModel> {
    return {
      ...project,
      dependencyGraph: project.dependencyGraph.map((node) => ({
        ...node,
        dependencies: Array.from(new Set(node.dependencies))
      }))
    };
  }

  async afterGenerate(context: GeneratorContextLike, result: GeneratorRunResult): Promise<void> {
    await super.afterGenerate(context as never, result);
  }

  async beforeGenerate(context: GeneratorContextLike): Promise<void> {
    await super.beforeGenerate(context as never);
  }

  dependencies(): readonly string[] {
    return this.manifest.dependencies;
  }

  async generate(context: GeneratorContextLike): Promise<GeneratedArtifact[]> {
    void context;
    return [];
  }

  async validate(context: GeneratorContextLike): Promise<void> {
    await super.validate(context as never);
  }
}
