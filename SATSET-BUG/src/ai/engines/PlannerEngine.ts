import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface PlanningOutput {
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  entities: string[];
  modules: string[];
  pages: string[];
  userRoles: string[];
  database: string[];
  api: string[];
  folderStructure: string[];
  taskBreakdown: string[];
  dependencies: string[];
  risks: string[];
  complexity: string;
}

export class PlannerEngine implements IEngine {
  public readonly name = "PlannerEngine";

  async run(context: Context): Promise<void> {
    const idea = context.metadata?.root ? context.projectName : "project";
    const plan: PlanningOutput = {
      functionalRequirements: ["Capture core application workflows", "Support user management", "Expose documented APIs"],
      nonFunctionalRequirements: ["Maintain deterministic builds", "Ensure testable architecture", "Support diagnostics and repair"],
      entities: ["User", "Project", "AuditEntry"],
      modules: ["Core", "API", "UI", "Tests"],
      pages: ["Home", "Dashboard", "Settings"],
      userRoles: ["Admin", "User"],
      database: ["Postgres", "Prisma"],
      api: ["REST", "OpenAPI"],
      folderStructure: ["src", "tests", "docs", "scripts"],
      taskBreakdown: ["Plan", "Generate", "Compile", "Test", "Repair", "Verify"],
      dependencies: ["Node.js", "pnpm", "Prisma", "TypeScript"],
      risks: ["Missing runtime dependencies", "Inconsistent configs"],
      complexity: "medium",
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    const planningTemplate = path.join(context.projectRoot, "templates", "planning.md.tpl");
    const planningOutput = path.join(context.projectRoot, "docs", "planning.md");

    await pipeline.run(context, [{
      id: "planning-doc",
      name: "planning-doc",
      templatePath: planningTemplate,
      outputPath: planningOutput,
      variables: {
        functionalRequirements: plan.functionalRequirements.map((item) => `- ${item}`).join("\n"),
        nonFunctionalRequirements: plan.nonFunctionalRequirements.map((item) => `- ${item}`).join("\n"),
        modules: plan.modules.map((item) => `- ${item}`).join("\n"),
      },
    }]);

    context.metadata = {
      ...context.metadata,
      root: context.projectRoot,
      packageJson: context.metadata.packageJson ?? { name: context.projectName },
      planning: plan,
    } as typeof context.metadata & { planning?: PlanningOutput };
  }
}
