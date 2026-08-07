import { GeneratorPlugin, KnowledgeRegistryReport, PluginKnowledge } from "../sdk/contracts.js";

export interface IKnowledgeRegistry {
  build(plugins: readonly GeneratorPlugin[]): Promise<KnowledgeRegistryReport>;
  findByCapability(capability: string, plugins: readonly GeneratorPlugin[]): GeneratorPlugin[];
}

export class KnowledgeRegistry implements IKnowledgeRegistry {
  async build(plugins: readonly GeneratorPlugin[]): Promise<KnowledgeRegistryReport> {
    const capabilities: PluginKnowledge[] = [];

    for (const plugin of plugins) {
      const knowledge = plugin.knowledge ? await plugin.knowledge() : plugin.manifest.capabilities.map((capability) => ({
        capability,
        description: plugin.manifest.description,
        plugin: plugin.manifest.name
      }));
      capabilities.push(...knowledge);
    }

    return {
      capabilities,
      plugins: plugins.map((plugin) => plugin.manifest.name)
    };
  }

  findByCapability(capability: string, plugins: readonly GeneratorPlugin[]): GeneratorPlugin[] {
    return plugins.filter((plugin) => plugin.manifest.capabilities.includes(capability));
  }
}
