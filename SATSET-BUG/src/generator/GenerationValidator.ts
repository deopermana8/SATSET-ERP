import type { ProjectPlan } from "../planner/ProjectPlanner.js";
import type { DatabasePlan } from "../planner/DatabaseDesigner.js";
import type { UIPlan } from "../planner/UIPlanner.js";
import type { ApiPlan } from "../planner/ApiPlanner.js";

export type ValidationSeverity = "critical" | "warning" | "info";

export interface ValidationIssue {
  severity: ValidationSeverity;
  category: string;
  message: string;
  detail?: string;
}

export interface ValidationReport {
  valid: boolean;
  canGenerate: boolean;
  issues: ValidationIssue[];
  criticalCount: number;
  warningCount: number;
}

function issue(severity: ValidationSeverity, category: string, message: string, detail?: string): ValidationIssue {
  return { severity, category, message, detail };
}

export class GenerationValidator {
  validate(
    project: ProjectPlan,
    database: DatabasePlan,
    ui: UIPlan,
    api: ApiPlan,
  ): ValidationReport {
    const issues: ValidationIssue[] = [];

    // --- Missing pages ---
    const expectedPages = new Set(project.pages ?? []);
    const actualPages = new Set(ui.pages.map((p) => p.name));
    for (const page of expectedPages) {
      if (!actualPages.has(page)) {
        issues.push(issue("warning", "missing-page", `Page "${page}" is in project plan but not in UI plan`));
      }
    }

    // --- Missing API endpoints ---
    const expectedApi = new Set(project.api ?? []);
    const actualApiPaths = new Set(api.endpoints.map((e) => e.path));
    for (const ep of expectedApi) {
      const base = ep.replace(/\/$/, "");
      const hasMatch = Array.from(actualApiPaths).some((p) => p.startsWith(base));
      if (!hasMatch) {
        issues.push(issue("warning", "missing-api", `Expected API path "${ep}" has no matching endpoints`));
      }
    }

    // --- Missing entities ---
    const expectedEntities = new Set(project.entities);
    const dbEntityNames = new Set(database.entities.map((e) => e.name));
    for (const entity of expectedEntities) {
      if (!dbEntityNames.has(entity)) {
        issues.push(issue("warning", "missing-entity", `Entity "${entity}" is in project plan but missing from database schema`));
      }
    }

    // --- Duplicated routes ---
    const routeKeys = api.endpoints.map((e) => `${e.method}:${e.path}`);
    const seenRoutes = new Set<string>();
    for (const key of routeKeys) {
      if (seenRoutes.has(key)) {
        issues.push(issue("critical", "duplicated-route", `Duplicate route: ${key}`));
      }
      seenRoutes.add(key);
    }

    // --- Duplicated models ---
    const modelNames = database.entities.map((e) => e.name);
    const seenModels = new Set<string>();
    for (const name of modelNames) {
      if (seenModels.has(name)) {
        issues.push(issue("critical", "duplicated-model", `Duplicate database model: "${name}"`));
      }
      seenModels.add(name);
    }

    // --- Duplicated page filenames ---
    const pageNames = ui.pages.map((p) => p.name);
    const seenPages = new Set<string>();
    for (const name of pageNames) {
      if (seenPages.has(name)) {
        issues.push(issue("critical", "duplicated-filename", `Duplicate page component: "${name}"`));
      }
      seenPages.add(name);
    }

    // --- Broken imports (check: forms reference entities that exist) ---
    const entitySet = new Set([...dbEntityNames, ...expectedEntities]);
    for (const form of ui.forms) {
      if (form.entity && !entitySet.has(form.entity)) {
        issues.push(issue("warning", "broken-import", `Form "${form.name}" references unknown entity "${form.entity}"`));
      }
    }

    // --- Warn if no modules planned ---
    if (project.modules.length === 0) {
      issues.push(issue("warning", "missing-page", "No modules are planned — output may be empty"));
    }

    // --- Critical: no output directory specified ---
    if (!project.projectType) {
      issues.push(issue("critical", "missing-entity", "Project type is not defined"));
    }

    const criticalCount = issues.filter((i) => i.severity === "critical").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;

    return {
      valid: issues.length === 0,
      canGenerate: criticalCount === 0,
      issues,
      criticalCount,
      warningCount,
    };
  }
}
