import { GeneratorPlugin, ProjectModel } from "../sdk/contracts.js";
import { KnowledgeRegistry } from "./KnowledgeRegistry.js";

export interface IRefactorEngine {
  run(project: ProjectModel, plugins: readonly GeneratorPlugin[]): Promise<ProjectModel>;
}

export class RefactorEngine implements IRefactorEngine {
  private readonly knowledgeRegistry = new KnowledgeRegistry();

  async run(project: ProjectModel, plugins: readonly GeneratorPlugin[]): Promise<ProjectModel> {
    let current = project;
    for (const plugin of this.knowledgeRegistry.findByCapability("refactor", plugins)) {
      if (plugin.refactorProject) {
        current = await plugin.refactorProject(current);
      }
    }
    return current;
  }
}
