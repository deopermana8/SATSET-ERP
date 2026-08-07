import { BasePlugin } from "../sdk/BasePlugin.js";
import { BusinessRuleDefinition, GeneratedArtifact, GeneratorContextLike, GeneratorRunResult, NormalizedBlueprint } from "../sdk/contracts.js";

export default class BusinessRulePlugin extends BasePlugin {
  constructor() {
    super({
      capabilities: ["business-rule", "module"],
      dependencies: ["WorkflowPlugin"],
      description: "Provide reusable business rules derived from domain blueprint.",
      name: "BusinessRulePlugin",
      priority: 225,
      targets: ["module", "entity", "dashboard", "report", "mobile", "scanner"],
      version: "3.0.0"
    });
  }

  async contributeBusinessRules(blueprint: NormalizedBlueprint): Promise<BusinessRuleDefinition[]> {
    return [
      {
        appliesTo: blueprint.entities.map((entity) => entity.name),
        description: `Ensure ${blueprint.module} approvals, audits, and reporting remain consistent.`,
        name: `${blueprint.module}BusinessPolicy`
      }
    ];
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
