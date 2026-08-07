import { ArchitectContextLike, GenerateCommand, GeneratorPlugin, NormalizedBlueprint } from "../sdk/contracts.js";
import { BlueprintFactory } from "./BlueprintFactory.js";
import { KnowledgeRegistry } from "./KnowledgeRegistry.js";

export interface IArchitectEngine {
  architect(command: GenerateCommand, plugins: readonly GeneratorPlugin[], projectRoot: string, generatorRoot: string): Promise<NormalizedBlueprint>;
}

export class ArchitectEngine implements IArchitectEngine {
  private readonly blueprintFactory = new BlueprintFactory();
  private readonly knowledgeRegistry = new KnowledgeRegistry();

  async architect(command: GenerateCommand, plugins: readonly GeneratorPlugin[], projectRoot: string, generatorRoot: string): Promise<NormalizedBlueprint> {
    const architectPlugins = this.knowledgeRegistry.findByCapability("architect", plugins);
    const context: ArchitectContextLike = {
      generatorRoot,
      projectRoot,
      requirement: command.name,
      createBlueprint: (seed) => this.blueprintFactory.create(seed)
    };

    for (const plugin of architectPlugins) {
      if (!plugin.architect) {
        continue;
      }

      const blueprint = await plugin.architect(context);
      if (blueprint) {
        return blueprint;
      }
    }

    return this.blueprintFactory.create({
      description: `Generated from requirement: ${command.name}`,
      entity: "Record",
      menu: [{ icon: "layer-group", label: command.name, path: `/${command.name.toLowerCase().replace(/\s+/g, "-")}` }],
      module: command.name,
      metadata: {
        source: "fallback-architect"
      }
    });
  }
}
