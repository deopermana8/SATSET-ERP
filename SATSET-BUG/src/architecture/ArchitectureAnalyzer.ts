import type { Context } from "../core/Context.js";

export interface ArchitectureAnalysis {
  complexity: "small" | "medium" | "large";
  scalability: number;
  maintainability: number;
  risk: number;
  deploymentStrategy: string;
  dataStrategy: string;
  apiStrategy: string;
  securityStrategy: string;
  testingStrategy: string;
  moduleBoundaries: string[];
  packageOrganization: string[];
  namingConvention: string;
}

export class ArchitectureAnalyzer {
  analyze(context: Context): ArchitectureAnalysis {
    const idea = typeof context.metadata?.idea === "string" ? context.metadata.idea : context.projectName;
    const complexity = idea.length > 30 ? "large" : idea.length > 15 ? "medium" : "small";
    return {
      complexity,
      scalability: complexity === "large" ? 0.9 : complexity === "medium" ? 0.75 : 0.6,
      maintainability: complexity === "large" ? 0.88 : complexity === "medium" ? 0.8 : 0.72,
      risk: complexity === "large" ? 0.3 : complexity === "medium" ? 0.2 : 0.1,
      deploymentStrategy: complexity === "large" ? "containerized" : "single-service",
      dataStrategy: complexity === "large" ? "postgresql" : "sqlite",
      apiStrategy: complexity === "large" ? "rest+queue" : "rest",
      securityStrategy: complexity === "large" ? "rbac+oauth" : "basic-auth",
      testingStrategy: complexity === "large" ? "integration-first" : "unit-first",
      moduleBoundaries: ["domain", "application", "infrastructure", "interface"],
      packageOrganization: ["src/domain", "src/application", "src/infrastructure", "src/interface"],
      namingConvention: "camelCase",
    };
  }
}
