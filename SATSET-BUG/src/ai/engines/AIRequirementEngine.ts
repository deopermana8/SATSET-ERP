import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface RequirementOutput {
  idea: string;
  modules: string[];
  actors: string[];
  businessRules: string[];
  permissions: string[];
  workflows: string[];
}

export class AIRequirementEngine implements IEngine {
  public readonly name = "AIRequirementEngine";

  async run(context: Context): Promise<void> {
    const requirementIdea = typeof context.metadata?.idea === "string" ? context.metadata.idea : context.projectName;
    const requirements: RequirementOutput = {
      idea: requirementIdea,
      modules: ["Core", "API", "UI", "Tests"],
      actors: ["Admin", "User"],
      businessRules: ["Users must authenticate", "Only admins can manage roles"],
      permissions: ["read", "write", "admin"],
      workflows: ["Login", "Create Record", "Approve Request"],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "requirements-json",
      name: "requirements-json",
      templatePath: path.join(context.projectRoot, "templates", "requirement.json.tpl"),
      outputPath: path.join(context.projectRoot, "requirements", "requirement.json"),
      variables: {
        idea: requirements.idea,
        modules: requirements.modules.join(","),
        actors: requirements.actors.join(","),
        businessRules: requirements.businessRules.join(","),
        permissions: requirements.permissions.join(","),
        workflows: requirements.workflows.join(","),
      },
    }]);

    context.metadata = {
      ...context.metadata,
      requirements,
    } as typeof context.metadata & { requirements?: RequirementOutput };
  }
}
