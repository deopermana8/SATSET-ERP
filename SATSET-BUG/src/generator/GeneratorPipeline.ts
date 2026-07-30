import { parseRequirement } from "../ai/RequirementParser.js";
import { planModules } from "../ai/ModulePlanner.js";
import { FileGenerator } from "./FileGenerator.js";
import { FolderGenerator } from "./FolderGenerator.js";
import { ReactAppGenerator } from "./ReactAppGenerator.js";
import { PrismaSchemaGenerator } from "./PrismaSchemaGenerator.js";
import { RestApiGenerator } from "./RestApiGenerator.js";
import { DashboardGenerator } from "./DashboardGenerator.js";

export interface PipelineReport {
  success: boolean;
  requirement: string;
  projectType: string;
  modules: string[];
  written: string[];
  errors: string[];
}

export async function runGeneratorPipeline(
  requirement: string,
  outputDir: string
): Promise<PipelineReport> {
  const written: string[] = [];
  const errors: string[] = [];

  // 1. Parse requirement
  const parsed = parseRequirement(requirement);

  // 2. Plan modules
  const plan = planModules(parsed);

  const projectName = requirement
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "project";

  // 3. Generate base files
  const fileGen = new FileGenerator();
  const fileResult = fileGen.generate(outputDir, {
    projectName,
    description: requirement,
    version: "0.1.0",
  });
  written.push(...fileResult.written);
  errors.push(...fileResult.errors);

  // 4. Generate folder structure
  const folderGen = new FolderGenerator();
  const folderResult = folderGen.generate(outputDir);
  written.push(...folderResult.created);
  errors.push(...folderResult.errors);

  // 5. Generate React app (App + Layout + Routing)
  const reactGen = new ReactAppGenerator();
  const reactResult = reactGen.generate(plan, outputDir);
  written.push(...reactResult.written);
  errors.push(...reactResult.errors);

  // 6. Generate Prisma schema
  const prismaGen = new PrismaSchemaGenerator();
  const prismaResult = prismaGen.generate(plan, outputDir);
  written.push(...prismaResult.written);
  errors.push(...prismaResult.errors);

  // 7. Generate REST API
  const apiGen = new RestApiGenerator();
  const apiResult = apiGen.generate(plan, outputDir);
  written.push(...apiResult.written);
  errors.push(...apiResult.errors);

  // 8. Generate Dashboard
  const dashGen = new DashboardGenerator();
  const dashResult = dashGen.generate(plan, outputDir);
  written.push(...dashResult.written);
  errors.push(...dashResult.errors);

  return {
    success: errors.length === 0,
    requirement,
    projectType: parsed.projectType,
    modules: plan.modules.map((m) => m.name),
    written,
    errors,
  };
}
