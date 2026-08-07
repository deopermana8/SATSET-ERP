import { GeneratorPlugin, NormalizedBlueprint } from "../sdk/contracts.js";
import { KnowledgeRegistry } from "./KnowledgeRegistry.js";

export interface IWorkflowEngine {
  design(blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[]): Promise<NormalizedBlueprint>;
}

export class WorkflowEngine implements IWorkflowEngine {
  private readonly knowledgeRegistry = new KnowledgeRegistry();

  async design(blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[]): Promise<NormalizedBlueprint> {
    let current = blueprint;
    for (const plugin of this.knowledgeRegistry.findByCapability("workflow", plugins)) {
      if (plugin.enrichBlueprint) {
        current = await plugin.enrichBlueprint(current);
      }
    }
    return current;
  }
}
