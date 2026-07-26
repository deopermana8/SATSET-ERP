export class DeploymentPlanner {
  plan(): string[] {
    return ["docker", "compose", "kubernetes"];
  }
}
