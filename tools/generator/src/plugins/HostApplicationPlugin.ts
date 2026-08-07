import { BasePlugin } from "../sdk/BasePlugin.js";
import { GeneratedArtifact, GeneratorContextLike } from "../sdk/contracts.js";

const hostTasks = [
  {
    template: "workspace/host-readme.md.tpl",
    output: "docs/generator/host-application.md"
  }
] as const;

export default class HostApplicationPlugin extends BasePlugin {
  constructor() {
    super({
      capabilities: ["host-application"],
      dependencies: [],
      description: "Host application bootstrap descriptor for generated workspace.",
      name: "HostApplicationPlugin",
      priority: 1260,
      targets: ["workspace"],
      version: "1.0.0"
    });
  }

  dependencies(): readonly string[] {
    return [];
  }

  async generate(context: GeneratorContextLike): Promise<GeneratedArtifact[]> {
    const firstEntity = context.blueprint.entities[0]?.name;
    if (!firstEntity || context.currentEntity.name !== firstEntity) {
      return [];
    }

    return context.generateFromTasks(this.manifest.name, hostTasks);
  }
}