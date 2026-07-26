import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";

export interface ReasoningOutput {
  intent: string;
  domain: string;
  requirements: string[];
  entities: string[];
  relationships: string[];
  useCases: string[];
  apiSpec: string[];
  databaseDesign: string[];
  screenSpecs: string[];
}

export class ReasoningEngine implements IEngine {
  public readonly name = "ReasoningEngine";

  async run(context: Context): Promise<void> {
    const rawIdea = typeof context.metadata?.idea === "string" ? context.metadata.idea : context.projectName;
    const output: ReasoningOutput = {
      intent: `Build ${rawIdea}`,
      domain: "enterprise",
      requirements: ["Authentication", "Core workflows", "Audit trail"],
      entities: ["User", "Project", "AuditEntry"],
      relationships: ["Project has many AuditEntry", "User owns Project"],
      useCases: ["Create project", "Approve request"],
      apiSpec: ["GET /projects", "POST /projects"],
      databaseDesign: ["Prisma schema", "Migrations"],
      screenSpecs: ["Dashboard", "Settings"],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    const specs = [
      { id: "requirement-json", name: "requirement-json", templatePath: path.join(context.projectRoot, "templates", "requirement.json.tpl"), outputPath: path.join(context.projectRoot, "requirement.json"), variables: { idea: output.intent, modules: output.entities.join(","), actors: "Admin,User", businessRules: output.requirements.join(","), permissions: "read,write,admin", workflows: output.useCases.join(",") } as Record<string, string> },
      { id: "architecture-md", name: "architecture-md", templatePath: path.join(context.projectRoot, "templates", "architecture.md.tpl"), outputPath: path.join(context.projectRoot, "architecture.md"), variables: { projectName: context.projectName } as Record<string, string> },
      { id: "entities-json", name: "entities-json", templatePath: path.join(context.projectRoot, "templates", "entities.json.tpl"), outputPath: path.join(context.projectRoot, "entities.json"), variables: { entities: output.entities.join(",") } as Record<string, string> },
      { id: "usecases-json", name: "usecases-json", templatePath: path.join(context.projectRoot, "templates", "usecases.json.tpl"), outputPath: path.join(context.projectRoot, "usecases.json"), variables: { useCases: output.useCases.join(",") } as Record<string, string> },
      { id: "api-json", name: "api-json", templatePath: path.join(context.projectRoot, "templates", "api.json.tpl"), outputPath: path.join(context.projectRoot, "api.json"), variables: { endpoints: output.apiSpec.join(",") } as Record<string, string> },
      { id: "database-json", name: "database-json", templatePath: path.join(context.projectRoot, "templates", "database.json.tpl"), outputPath: path.join(context.projectRoot, "database.json"), variables: { design: output.databaseDesign.join(",") } as Record<string, string> },
      { id: "screens-json", name: "screens-json", templatePath: path.join(context.projectRoot, "templates", "screens.json.tpl"), outputPath: path.join(context.projectRoot, "screens.json"), variables: { screens: output.screenSpecs.join(",") } as Record<string, string> },
      { id: "workflow-json", name: "workflow-json", templatePath: path.join(context.projectRoot, "templates", "workflow.json.tpl"), outputPath: path.join(context.projectRoot, "workflow.json"), variables: { workflow: output.useCases.join(",") } as Record<string, string> },
    ];

    await pipeline.run(context, specs);

    context.metadata = {
      ...context.metadata,
      reasoning: output,
    } as typeof context.metadata & { reasoning?: ReasoningOutput };
  }
}
