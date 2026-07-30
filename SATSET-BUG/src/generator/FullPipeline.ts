import { parseRequirement } from "../ai/RequirementParser.js";
import { planModules } from "../ai/ModulePlanner.js";
import { generateDomainModel } from "./DomainModelGenerator.js";
import { DatabaseDesigner } from "./DatabaseDesigner.js";
import { LayeredApiGenerator } from "./LayeredApiGenerator.js";
import { AuthGenerator } from "./AuthGenerator.js";
import { FullAuthGenerator } from "./FullAuthGenerator.js";
import { ZodValidationGenerator } from "./ZodValidationGenerator.js";
import { DtoGenerator } from "./DtoGenerator.js";
import { ApiClientGenerator } from "./ApiClientGenerator.js";
import { CrudPageGenerator } from "./CrudPageGenerator.js";
import { ResponsiveDashboardGenerator } from "./ResponsiveDashboardGenerator.js";
import { FullDashboardGenerator } from "./FullDashboardGenerator.js";
import { ReactAppGenerator } from "./ReactAppGenerator.js";
import { RestApiGenerator } from "./RestApiGenerator.js";
import { FileGenerator } from "./FileGenerator.js";
import { FolderGenerator } from "./FolderGenerator.js";
import { DocumentationAutoGenerator } from "./DocumentationAutoGenerator.js";
import { ProjectPlanner } from "../planner/ProjectPlanner.js";
import { QualityReporter } from "../report/QualityReporter.js";
import { ZipExporter } from "../export/ZipExporter.js";
import { ProductionStructureGenerator } from "./ProductionStructureGenerator.js";
import { DatabaseMigrationGenerator } from "./DatabaseMigrationGenerator.js";
import { DatabaseDesignerPlanner } from "../planner/DatabaseDesigner.js";
import { ApiPlanner } from "../planner/ApiPlanner.js";
import { OpenApiGenerator } from "./OpenApiGenerator.js";
import { DeploymentGenerator } from "./DeploymentGenerator.js";
import { GeneratedProjectValidator } from "./GeneratedProjectValidator.js";
import fs from "node:fs";
import path from "node:path";

export interface FullPipelineReport {
  success: boolean;
  requirement: string;
  projectType: string;
  modules: string[];
  entities: string[];
  written: string[];
  errors: string[];
}

export async function runFullPipeline(
  requirement: string,
  outputDir: string
): Promise<FullPipelineReport> {
  const written: string[] = [];
  const errors: string[] = [];

  // 1. Parse requirement
  const parsed = parseRequirement(requirement);

  // 2. Plan modules
  const plan = planModules(parsed);

  // 3. Generate domain model
  const domain = generateDomainModel(parsed);

  // 4. Base files + folder structure
  const projectName = requirement
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "project";

  const fileGen = new FileGenerator();
  const fileResult = fileGen.generate(outputDir, { projectName, description: requirement, version: "0.1.0" });
  written.push(...fileResult.written);
  errors.push(...fileResult.errors);

  const folderGen = new FolderGenerator();
  const folderResult = folderGen.generate(outputDir);
  written.push(...folderResult.created);
  errors.push(...folderResult.errors);

  // 5. Database schema
  const dbDesigner = new DatabaseDesigner();
  const { schema } = dbDesigner.design(domain);
  const prismaDir = path.join(outputDir, "prisma");
  try {
    fs.mkdirSync(prismaDir, { recursive: true });
    const schemaPath = path.join(prismaDir, "schema.prisma");
    fs.writeFileSync(schemaPath, schema, "utf8");
    written.push(schemaPath);
  } catch (err) {
    errors.push(`failed to write schema.prisma: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 6. Backend: layered API + auth + validation
  const apiGen = new LayeredApiGenerator();
  const apiResult = apiGen.generate(domain, outputDir);
  written.push(...apiResult.written);
  errors.push(...apiResult.errors);

  const authGen = new FullAuthGenerator();
  const authResult = authGen.generate(outputDir);
  written.push(...authResult.written);
  errors.push(...authResult.errors);

  const zodGen = new ZodValidationGenerator();
  const zodResult = zodGen.generate(domain, outputDir);
  written.push(...zodResult.written);
  errors.push(...zodResult.errors);

  const dtoGen = new DtoGenerator();
  const dtoResult = dtoGen.generate(domain, outputDir);
  written.push(...dtoResult.written);
  errors.push(...dtoResult.errors);

  const apiClientGen = new ApiClientGenerator();
  const apiClientResult = apiClientGen.generate(domain, outputDir);
  written.push(...apiClientResult.written);
  errors.push(...apiClientResult.errors);

  // 7. Frontend: CRUD pages + dashboard
  const crudGen = new CrudPageGenerator();
  const crudResult = crudGen.generate(domain, outputDir);
  written.push(...crudResult.written);
  errors.push(...crudResult.errors);

  const reactGen = new ReactAppGenerator();
  const reactResult = reactGen.generate(plan, outputDir);
  written.push(...reactResult.written);
  errors.push(...reactResult.errors);

  const restGen = new RestApiGenerator();
  const restResult = restGen.generate(plan, outputDir);
  written.push(...restResult.written);
  errors.push(...restResult.errors);

  const dashGen = new FullDashboardGenerator();
  const dashResult = dashGen.generate(domain, outputDir);
  written.push(...dashResult.written);
  errors.push(...dashResult.errors);

  // Auto-generate documentation files
  const projectPlan = new ProjectPlanner().plan({ requirement, projectType: parsed.projectType, modules: parsed.modules, outputDir });
  const docGen = new DocumentationAutoGenerator();
  const docResult = docGen.generate(projectPlan, outputDir);
  written.push(...docResult.written);
  errors.push(...docResult.errors);

  // Generate production structure files
  const prodGen = new ProductionStructureGenerator();
  const prodResult = prodGen.generate({ projectName: requirement.slice(0, 40), outputDir });
  written.push(...prodResult.written);
  errors.push(...prodResult.errors);

  // Generate database migration support
  const dbPlan = new DatabaseDesignerPlanner().design(projectPlan);
  const migGen = new DatabaseMigrationGenerator();
  const migResult = migGen.generate(dbPlan, outputDir);
  written.push(...migResult.written);
  errors.push(...migResult.errors);

  // Generate OpenAPI / Swagger / Postman docs
  const apiPlan = new ApiPlanner().plan(projectPlan);
  const openApiGen = new OpenApiGenerator();
  const openApiResult = openApiGen.generate(apiPlan, outputDir);
  written.push(...openApiResult.written);
  errors.push(...openApiResult.errors);

  // Generate deployment files
  const deployGen = new DeploymentGenerator();
  const deployResult = deployGen.generate({ projectName: requirement.slice(0, 40), outputDir });
  written.push(...deployResult.written);
  errors.push(...deployResult.errors);

  // Write quality report
  new QualityReporter().write({
    outputDir,
    written,
    errors,
    modules: plan.modules.map((m) => m.name),
    typecheckPassed: errors.length === 0,
  });

  // Export ZIP archive after successful generation
  if (errors.length === 0) {
    try { new ZipExporter().export(outputDir); } catch { /* non-blocking */ }
  }

  // Run production validation and write PRODUCTION_REPORT.md
  try {
    const validator = new GeneratedProjectValidator();
    const validationResult = validator.validate(outputDir);
    validator.writeReport(validationResult);
  } catch { /* non-blocking */ }

  return {
    success: errors.length === 0,
    requirement,
    projectType: parsed.projectType,
    modules: plan.modules.map((m) => m.name),
    entities: domain.entities.map((e) => e.name),
    written,
    errors,
  };
}
