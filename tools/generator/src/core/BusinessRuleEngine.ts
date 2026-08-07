import { BusinessRuleDefinition, GeneratorPlugin, NormalizedBlueprint } from "../sdk/contracts.js";
import { KnowledgeRegistry } from "./KnowledgeRegistry.js";

export interface IBusinessRuleEngine {
  collect(blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[]): Promise<BusinessRuleDefinition[]>;
}

export class BusinessRuleEngine implements IBusinessRuleEngine {
  private readonly knowledgeRegistry = new KnowledgeRegistry();

  async collect(blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[]): Promise<BusinessRuleDefinition[]> {
    const rules: BusinessRuleDefinition[] = [];
    for (const plugin of this.knowledgeRegistry.findByCapability("business-rule", plugins)) {
      if (!plugin.contributeBusinessRules) {
        continue;
      }
      rules.push(...await plugin.contributeBusinessRules(blueprint));
    }
    return rules;
  }
}
