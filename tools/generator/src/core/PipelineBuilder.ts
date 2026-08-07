import { PipelineDefinition, PipelineStage } from "../sdk/contracts.js";

export interface IPipelineBuilder {
  build(pluginNames: readonly string[], pipeline: PipelineDefinition): PipelineDefinition;
}

export class PipelineBuilder implements IPipelineBuilder {
  build(pluginNames: readonly string[], pipeline: PipelineDefinition): PipelineDefinition {
    const stages: PipelineStage[] = pluginNames.map((pluginName) => ({
      name: pluginName,
      pluginNames: [pluginName]
    }));

    return {
      ...pipeline,
      stages
    };
  }
}
