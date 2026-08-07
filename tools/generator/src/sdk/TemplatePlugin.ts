import { Context } from "../core/Context.js";
import { PluginManifest, TemplateTask } from "./contracts.js";
import { BasePlugin } from "./BasePlugin.js";

export interface TemplatePluginDefinition {
  manifest?: PluginManifest;
  capabilities?: readonly ("module" | "entity" | "dashboard" | "report" | "mobile" | "scanner")[];
  dependencies?: readonly string[];
  name?: string;
  requiredBlueprintPaths?: readonly string[];
  tasks: readonly TemplateTask[];
}

export class TemplatePlugin extends BasePlugin {
  constructor(private readonly definition: TemplatePluginDefinition) {
    super(TemplatePlugin.createManifest(definition));
  }

  dependencies(): readonly string[] {
    return this.manifest.dependencies;
  }

  async generate(context: Context) {
    return context.generateFromTasks(this.manifest.name, this.definition.tasks);
  }

  async validate(context: Context): Promise<void> {
    await super.validate(context);
    for (const requiredPath of this.definition.requiredBlueprintPaths ?? []) {
      context.ensureBlueprintValue(requiredPath);
    }
  }

  private static createManifest(definition: TemplatePluginDefinition): PluginManifest {
    if (definition.manifest) {
      return definition.manifest;
    }

    return {
      capabilities: definition.capabilities ?? ["module"],
      dependencies: definition.dependencies ?? [],
      description: `${definition.name ?? "Plugin"} generated from reusable templates`,
      name: definition.name ?? "TemplatePlugin",
      priority: 100,
      targets: definition.capabilities ?? ["module"],
      version: "2.0.0"
    };
  }
}
