export enum PipelineStage {
  Initialize = "Initialize",
  LoadMetadata = "LoadMetadata",
  LoadPlugins = "LoadPlugins",
  Scan = "Scan",
  Analyze = "Analyze",
  CollectIssues = "CollectIssues",
  SuggestFixes = "SuggestFixes",
  Report = "Report",
  Finish = "Finish",
}

export interface PipelineStep {
  stage: PipelineStage;
  name: string;
  description: string;
}

export class Pipeline {
  private readonly steps: PipelineStep[] = [];

  register(step: PipelineStep): void {
    this.steps.push(step);
  }

  getSteps(): readonly PipelineStep[] {
    return this.steps;
  }
}
