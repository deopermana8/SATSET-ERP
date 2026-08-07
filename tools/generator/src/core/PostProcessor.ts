import { GeneratorRunResult } from "../sdk/contracts.js";
import { FileSystem } from "../utils/FileSystem.js";
import { path } from "../utils/Node.js";
import { AutoFixBridge } from "./AutoFixBridge.js";
import { Context } from "./Context.js";

export interface IPostProcessor {
  process(context: Context, result: GeneratorRunResult): Promise<void>;
}

export class PostProcessor implements IPostProcessor {
  private readonly fileSystem = new FileSystem();

  constructor(private readonly autoFixBridge = new AutoFixBridge()) {}

  async process(context: Context, result: GeneratorRunResult): Promise<void> {
    const manifestPath = path.join(context.outputRoot, "modules", context.names.module.kebab, "generation-manifest.json");
    this.fileSystem.writeText(manifestPath, `${JSON.stringify({
      generatedAt: context.generatedAt,
      module: context.blueprint.module,
      entity: context.blueprint.entity,
      workflow: context.blueprint.workflow,
      api: context.blueprint.api,
      validation: context.blueprint.validation,
      pluginOrder: result.pluginOrder,
      artifacts: result.artifacts
    }, null, 2)}\n`);
    await this.autoFixBridge.run(context);
  }
}
