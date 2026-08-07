import { Context } from "../core/Context.js";
import { GeneratorPlugin, GeneratorRunResult, PluginManifest } from "./contracts.js";

export abstract class BasePlugin implements GeneratorPlugin {
  constructor(public readonly manifest: PluginManifest) {}

  async beforeGenerate(context: Context): Promise<void> {
    context.log("info", `[${this.manifest.name}] beforeGenerate`);
  }

  async afterGenerate(context: Context, result: GeneratorRunResult): Promise<void> {
    context.log("info", `[${this.manifest.name}] afterGenerate (${result.artifacts.length} artifacts accumulated)`);
  }

  abstract dependencies(): readonly string[];

  abstract generate(context: Context): Promise<GeneratorRunResult["artifacts"]>;

  async validate(context: Context): Promise<void> {
    context.ensureBlueprintValue("module");
    context.ensureBlueprintValue("entities");
  }
}
