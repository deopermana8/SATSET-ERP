import { EntityPlan } from "../sdk/contracts.js";
import { Context } from "./Context.js";
import { Logger } from "./Logger.js";
import { TemplateEngine } from "./TemplateEngine.js";

export interface PipelineContextFactoryOptions {
  command: Context["command"];
  entityPlan: EntityPlan;
  generatorRoot: string;
  logger: Logger;
  outputRoot: string;
  projectRoot: string;
  templateEngine: TemplateEngine;
}

export interface IPipelineContextFactory {
  create(options: PipelineContextFactoryOptions): Context;
}

export class PipelineContextFactory implements IPipelineContextFactory {
  create(options: PipelineContextFactoryOptions): Context {
    return new Context({
      blueprint: options.entityPlan.normalizedBlueprint,
      command: options.command,
      currentEntity: options.entityPlan.entity,
      generatorRoot: options.generatorRoot,
      logger: options.logger,
      outputRoot: options.outputRoot,
      projectRoot: options.projectRoot,
      templateEngine: options.templateEngine
    });
  }
}
