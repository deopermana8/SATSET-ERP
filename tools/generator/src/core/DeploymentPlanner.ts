import { NormalizedBlueprint, PipelineDefinition } from "../sdk/contracts.js";

export interface DeploymentPlan {
  blueprint: string;
  pipelineStages: string[];
  target: string;
}

export interface IDeploymentPlanner {
  plan(blueprint: NormalizedBlueprint, pipeline: PipelineDefinition): DeploymentPlan;
}

export class DeploymentPlanner implements IDeploymentPlanner {
  plan(blueprint: NormalizedBlueprint, pipeline: PipelineDefinition): DeploymentPlan {
    return {
      blueprint: blueprint.module,
      pipelineStages: pipeline.stages.map((stage) => stage.name),
      target: `${blueprint.module.toLowerCase()}-deployment`
    };
  }
}
