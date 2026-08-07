import { EntityBlueprintItem, GenerateCommand, GeneratedArtifact, GeneratorContextNames, NormalizedBlueprint, TemplateTask } from "../sdk/contracts.js";
import { FileSystem } from "../utils/FileSystem.js";
import { NameFormatter } from "../utils/Naming.js";
import { path } from "../utils/Node.js";
import { Logger } from "./Logger.js";
import { TemplateEngine } from "./TemplateEngine.js";

export interface ContextOptions {
  blueprint: NormalizedBlueprint;
  command: GenerateCommand;
  currentEntity: EntityBlueprintItem;
  generatorRoot: string;
  logger: Logger;
  outputRoot?: string;
  projectRoot: string;
  templateEngine: TemplateEngine;
}

export class Context {
  readonly blueprint: NormalizedBlueprint;
  readonly command: GenerateCommand;
  readonly currentEntity: EntityBlueprintItem;
  readonly generatedAt: string;
  readonly generatorRoot: string;
  readonly names: GeneratorContextNames;
  readonly outputRoot: string;
  readonly projectRoot: string;
  private readonly fileSystem = new FileSystem();
  private readonly logger: Logger;
  private readonly templateEngine: TemplateEngine;

  constructor(options: ContextOptions) {
    const formatter = new NameFormatter();
    this.blueprint = options.blueprint;
    this.command = options.command;
    this.currentEntity = options.currentEntity;
    this.generatedAt = new Date().toISOString();
    this.generatorRoot = options.generatorRoot;
    this.logger = options.logger;
    this.outputRoot = options.outputRoot ?? path.join(this.generatorRoot, "output");
    this.projectRoot = options.projectRoot;
    this.templateEngine = options.templateEngine;
    this.names = {
      module: formatter.format(this.blueprint.module),
      entity: formatter.format(this.currentEntity.name)
    };
  }

  ensureBlueprintValue(pathExpression: string): void {
    const value = this.getBlueprintValue(pathExpression);
    if (typeof value === "undefined" || value === null || value === "") {
      throw new Error(`Blueprint value is required: ${pathExpression}`);
    }
  }

  async generateFromTasks(pluginName: string, tasks: readonly TemplateTask[]): Promise<GeneratedArtifact[]> {
    const model = this.createModel();
    this.fileSystem.ensureDirectory(this.outputRoot);
    const artifacts = await this.templateEngine.renderTasks(pluginName, tasks, model, this.generatorRoot, this.outputRoot);
    this.log("info", `[${pluginName}] generated ${artifacts.length} artifact(s)`);
    return artifacts;
  }

  getBlueprintValue(pathExpression: string): unknown {
    const segments = pathExpression.split(".").filter((segment) => segment.length > 0);
    let current: unknown = this.blueprint;

    for (const segment of segments) {
      if (typeof current !== "object" || current === null || !(segment in (current as Record<string, unknown>))) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[segment];
    }

    return current;
  }

  log(level: "debug" | "info" | "warn" | "error", message: string): void {
    this.logger.log(level, message);
  }

  private createModel(): Record<string, unknown> {
    return {
      blueprint: this.blueprint,
      command: this.command,
      currentEntity: this.currentEntity,
      generatedAt: this.generatedAt,
      names: this.names,
      outputRoot: this.outputRoot,
      projectRoot: this.projectRoot
    };
  }
}
