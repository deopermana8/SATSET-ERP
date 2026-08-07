import { BasePlugin } from "../sdk/BasePlugin.js";
import { GeneratedArtifact, GeneratorContextLike } from "../sdk/contracts.js";

const environmentTasks = [
  {
    template: "workspace/env.example.tpl",
    output: "env.example"
  }
] as const;

export default class EnvironmentGeneratorPlugin extends BasePlugin {
  constructor() {
    super({
      capabilities: ["environment"],
      dependencies: ["RuntimeGeneratorPlugin"],
      description: "Generate workspace environment defaults.",
      name: "EnvironmentGeneratorPlugin",
      priority: 1200,
      targets: ["workspace"],
      version: "1.0.0"
    });
  }

  dependencies(): readonly string[] {
    return this.manifest.dependencies;
  }

  async generate(context: GeneratorContextLike): Promise<GeneratedArtifact[]> {
    const firstEntity = context.blueprint.entities[0]?.name;
    if (!firstEntity || context.currentEntity.name !== firstEntity) {
      return [];
    }

    return context.generateFromTasks(this.manifest.name, environmentTasks);
  }
}