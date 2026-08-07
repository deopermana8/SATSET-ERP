import { TemplatePlugin, TemplatePluginDefinition } from "../../sdk/TemplatePlugin.js";

export interface CrudGeneratorPluginConfig {
  capabilities: readonly string[];
  dependencies: readonly string[];
  description: string;
  name: string;
  priority: number;
  requiredBlueprintPaths?: readonly string[];
  tasks?: TemplatePluginDefinition["tasks"];
}

export function createCrudGeneratorDefinition(config: CrudGeneratorPluginConfig): TemplatePluginDefinition {
  return {
    manifest: {
      capabilities: config.capabilities,
      dependencies: config.dependencies,
      description: config.description,
      name: config.name,
      priority: config.priority,
      targets: ["module", "entity"],
      version: "2.0.0"
    },
    requiredBlueprintPaths: config.requiredBlueprintPaths ?? ["module", "entity", "fields"],
    tasks: config.tasks ?? []
  };
}

export function createCrudGeneratorPlugin(config: CrudGeneratorPluginConfig): TemplatePlugin {
  return new TemplatePlugin(createCrudGeneratorDefinition(config));
}
