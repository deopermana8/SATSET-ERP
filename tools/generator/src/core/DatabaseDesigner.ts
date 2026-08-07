import { GeneratorPlugin, NormalizedBlueprint } from "../sdk/contracts.js";
import { KnowledgeRegistry } from "./KnowledgeRegistry.js";

export interface IDatabaseDesigner {
  design(blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[]): Promise<NormalizedBlueprint>;
}

export class DatabaseDesigner implements IDatabaseDesigner {
  private readonly knowledgeRegistry = new KnowledgeRegistry();

  async design(blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[]): Promise<NormalizedBlueprint> {
    let current = blueprint;
    for (const plugin of this.knowledgeRegistry.findByCapability("database", plugins)) {
      if (plugin.enrichBlueprint) {
        current = await plugin.enrichBlueprint(current);
      }
    }
    return current;
  }
}
