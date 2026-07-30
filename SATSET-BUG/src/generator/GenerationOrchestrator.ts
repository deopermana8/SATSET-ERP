import os from "node:os";
import path from "node:path";
import { parseRequirement } from "../ai/RequirementParser.js";
import { ProjectPlanner, type ProjectPlan } from "../planner/ProjectPlanner.js";
import { DatabaseDesignerPlanner, type DatabasePlan } from "../planner/DatabaseDesigner.js";
import { UIPlanner, type UIPlan } from "../planner/UIPlanner.js";
import { ApiPlanner, type ApiPlan } from "../planner/ApiPlanner.js";
import { GeneratorRouter } from "../generator/GeneratorRouter.js";
import { GenerationValidator } from "../generator/GenerationValidator.js";
import { ProjectWriter } from "../writer/ProjectWriter.js";
import { AssetPipeline } from "../assets/AssetPipeline.js";
import type { GenerationResult } from "../generator/IGenerator.js";

export interface OrchestrationInput {
  requirement: string;
  outputDir?: string;
}

export interface OrchestrationPlan {
  requirement: string;
  project: ProjectPlan;
  database: DatabasePlan;
  ui: UIPlan;
  api: ApiPlan;
}

export interface OrchestrationResult {
  plan: OrchestrationPlan;
  generation: GenerationResult;
  outputDir: string;
  writeSummary: ReturnType<ProjectWriter["summary"]>;
  validation: import("./GenerationValidator.js").ValidationReport;
}

// Stage runners — each returns immutable data
function stageParser(requirement: string) {
  return parseRequirement(requirement);
}

function stagePlanner(requirement: string): ProjectPlan {
  const parsed = stageParser(requirement);
  return new ProjectPlanner().plan({
    requirement,
    projectType: parsed.projectType,
    modules: parsed.modules,
    outputDir: "",
  });
}

function stageDatabase(project: ProjectPlan): DatabasePlan {
  return new DatabaseDesignerPlanner().design(project);
}

function stageUI(project: ProjectPlan): UIPlan {
  return new UIPlanner().plan(project);
}

function stageApi(project: ProjectPlan): ApiPlan {
  return new ApiPlanner().plan(project);
}

async function stageGenerate(requirement: string, project: ProjectPlan, outputDir: string): Promise<GenerationResult> {
  const router = new GeneratorRouter();
  return router.generate({
    requirement,
    projectType: project.projectType,
    modules: project.modules,
    outputDir,
  });
}

export class GenerationOrchestrator {
  async run(input: OrchestrationInput): Promise<OrchestrationResult> {
    const outputDir = input.outputDir ?? path.join(os.tmpdir(), `satset-orch-${Date.now()}`);
    const writer = new ProjectWriter({ overwrite: true });

    // Stage 1: Parse + Plan (pure data, no files written)
    const project = stagePlanner(input.requirement);

    // Stage 2: Database + UI + API plans (pure data, no files written)
    const [database, ui, api] = [
      stageDatabase(project),
      stageUI(project),
      stageApi(project),
    ];

    const plan: OrchestrationPlan = { requirement: input.requirement, project, database, ui, api };

    // Validate plan before writing
    const validation = new GenerationValidator().validate(project, database, ui, api);

    // Write plan metadata via ProjectWriter
    writer.writeFile(
      path.join(outputDir, ".satset", "plan.json"),
      JSON.stringify({ projectType: plan.project.projectType, modules: plan.project.modules, entities: plan.project.entities, validation: { canGenerate: validation.canGenerate, criticalCount: validation.criticalCount, warningCount: validation.warningCount } }, null, 2)
    );

    // Run asset pipeline
    new AssetPipeline().run(outputDir);

    // Stop if critical validation failures
    if (!validation.canGenerate) {
      return {
        plan, generation: { success: false, written: [], errors: validation.issues.filter((i) => i.severity === "critical").map((i) => i.message), summary: "Generation blocked by critical validation errors" },
        outputDir, writeSummary: writer.summary(), validation,
      };
    }

    // Stage 3: GeneratorRouter generates actual project files
    const generation = await stageGenerate(input.requirement, project, outputDir);

    return { plan, generation, outputDir, writeSummary: writer.summary(), validation };
  }
}
