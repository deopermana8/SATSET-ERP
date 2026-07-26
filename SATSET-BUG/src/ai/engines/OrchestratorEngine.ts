import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { PlannerEngine } from "./PlannerEngine.js";
import { ArchitectureEngine } from "./ArchitectureEngine.js";
import { DatabaseGenerator } from "./DatabaseGenerator.js";
import { BackendGenerator } from "./BackendGenerator.js";
import { FrontendGenerator } from "./FrontendGenerator.js";
import { TestingGenerator } from "./TestingGenerator.js";
import { AuthenticationGenerator } from "./AuthenticationGenerator.js";
import { OpenApiGenerator } from "./OpenApiGenerator.js";
import { DockerGenerator } from "./DockerGenerator.js";
import { DeploymentGenerator } from "./DeploymentGenerator.js";
import { DocumentationGenerator } from "./DocumentationGenerator.js";
import { WorkflowEngine } from "./WorkflowEngine.js";

export class OrchestratorEngine implements IEngine {
  public readonly name = "OrchestratorEngine";
  private readonly engines: IEngine[];

  constructor(engines?: IEngine[]) {
    this.engines = engines ?? [
      new PlannerEngine(),
      new ArchitectureEngine(),
      new DatabaseGenerator(),
      new BackendGenerator(),
      new FrontendGenerator(),
      new TestingGenerator(),
      new AuthenticationGenerator(),
      new OpenApiGenerator(),
      new DockerGenerator(),
      new DeploymentGenerator(),
      new DocumentationGenerator(),
      new WorkflowEngine(),
    ];
  }

  async run(context: Context): Promise<void> {
    for (const engine of this.engines) {
      await engine.run(context);
    }
  }
}
