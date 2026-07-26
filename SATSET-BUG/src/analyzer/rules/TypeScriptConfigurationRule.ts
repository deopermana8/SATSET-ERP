import type { Context } from "../../core/Context.js";
import type { Issue } from "../../core/Issue.js";
import type { Evidence } from "../../core/Evidence.js";
import type { FixSuggestion } from "../../core/FixSuggestion.js";
import type { IRule } from "../IRule.js";
import { Severity } from "../../core/Severity.js";

const acceptedModuleResolutions = new Set([
  "node",
  "bundler",
  "nodenext",
  "node16",
]);

export class TypeScriptConfigurationRule implements IRule {
  public readonly id = "typescript-configuration";
  public readonly name = "TypeScript Configuration";
  public readonly category = "typescript";

  public match(context: Context): boolean {
    const metadata = context.metadata as Record<string, unknown>;
    return metadata.typescript !== undefined && metadata.typescript !== null;
  }

  public analyze(context: Context): Issue[] {
    const metadata = context.metadata as Record<string, unknown>;
    const tsMetadata = metadata.typescript as Record<string, unknown> | undefined;
    const packageJson = metadata.packageJson as Record<string, unknown> | undefined;
    const workspaces = packageJson?.workspaces;
    const isWorkspaceProject = workspaces !== undefined && workspaces !== null;

    const issues: Issue[] = [];
    if (!tsMetadata) {
      return issues;
    }

    const configExists = Boolean(tsMetadata.configExists);
    const configPath = typeof tsMetadata.configPath === "string" ? tsMetadata.configPath : "tsconfig.json";
    const version = typeof tsMetadata.version === "string" ? tsMetadata.version : null;
    const strict = tsMetadata.strict === true ? true : tsMetadata.strict === false ? false : null;
    const moduleResolution = typeof tsMetadata.moduleResolution === "string" ? tsMetadata.moduleResolution : null;
    const paths = tsMetadata.paths as Record<string, unknown> | null;
    const references = Array.isArray(tsMetadata.references) ? tsMetadata.references : null;

    if (!configExists) {
      issues.push({
        id: "typescript-config-missing",
        title: "TypeScript configuration file is missing",
        category: "typescript",
        severity: Severity.Error,
        message: "tsconfig.json is not present in the project root.",
        evidence: [
          {
            id: "tsconfig-file-not-found",
            type: "file",
            file: "tsconfig.json",
            description: "TypeScript configuration file is required by the scanner.",
            expected: "tsconfig.json exists",
            actual: "not found",
          },
        ],
        fixes: [
          {
            id: "create-tsconfig",
            title: "Create tsconfig.json",
            description: "Add a tsconfig.json file with the required compiler options.",
            risk: "low",
            automatic: false,
            steps: [
              "Create tsconfig.json in the project root.",
              "Include compilerOptions like moduleResolution, target, strict, and paths as needed.",
            ],
          },
        ],
      });
    }

    if (!version) {
      issues.push({
        id: "typescript-version-missing",
        title: "TypeScript dependency is not found",
        category: "typescript",
        severity: Severity.Error,
        message: "TypeScript package version could not be resolved from node_modules or package.json.",
        evidence: [
          {
            id: "typescript-version-missing-evidence",
            type: "file",
            file: "package.json",
            description: "No TypeScript dependency was found in package.json or node_modules.",
            expected: "typescript dependency present",
            actual: "missing or version unknown",
          },
        ],
        fixes: [
          {
            id: "install-typescript",
            title: "Install TypeScript",
            description: "Add TypeScript to the project dependencies.",
            risk: "low",
            automatic: false,
            steps: ["Run npm install --save-dev typescript"],
          },
        ],
      });
    }

    if (strict === false) {
      issues.push({
        id: "typescript-strict-disabled",
        title: "TypeScript strict mode is disabled",
        category: "typescript",
        severity: Severity.Warning,
        message: "The tsconfig.json compiler option strict is set to false.",
        evidence: [
          {
            id: "typescript-strict-disabled-evidence",
            type: "file",
            file: configPath,
            description: "The strict compiler option is disabled in tsconfig.json.",
            expected: "strict: true",
            actual: "strict: false",
          },
        ],
        fixes: [
          {
            id: "enable-typescript-strict",
            title: "Enable strict mode",
            description: "Set compilerOptions.strict to true in tsconfig.json.",
            risk: "low",
            automatic: false,
            steps: ["Open tsconfig.json", "Set compilerOptions.strict to true."],
          },
        ],
      });
    }

    if (moduleResolution !== null && !acceptedModuleResolutions.has(moduleResolution.toLowerCase())) {
      issues.push({
        id: "typescript-module-resolution-invalid",
        title: "TypeScript moduleResolution is not standard",
        category: "typescript",
        severity: Severity.Warning,
        message: `moduleResolution is set to '${moduleResolution}', which is not one of the common values (${Array.from(
          acceptedModuleResolutions
        ).join(", ")}).`,
        evidence: [
          {
            id: "typescript-module-resolution-evidence",
            type: "file",
            file: configPath,
            description: "The moduleResolution setting does not match the expected configuration.",
            expected: `moduleResolution: ${Array.from(acceptedModuleResolutions).join(" or ")}`,
            actual: moduleResolution,
          },
        ],
        fixes: [
          {
            id: "fix-module-resolution",
            title: "Update moduleResolution",
            description: "Use a standard moduleResolution value in tsconfig.json.",
            risk: "low",
            automatic: false,
            steps: [
              "Open tsconfig.json",
              "Set compilerOptions.moduleResolution to node, bundler, node16, or nodenext.",
            ],
          },
        ],
      });
    }

    if (isWorkspaceProject) {
      const pathsEmpty = paths === null || (typeof paths === "object" && paths !== null && Object.keys(paths).length === 0);
      if (pathsEmpty) {
        issues.push({
          id: "typescript-paths-empty-workspace",
          title: "Compiler paths are empty in a workspace project",
          category: "typescript",
          severity: Severity.Warning,
          message: "Workspace projects should define compilerOptions.paths for package aliases and workspace imports.",
          evidence: [
            {
              id: "typescript-paths-empty-evidence",
              type: "file",
              file: configPath,
              description: "The compilerOptions.paths property is missing or empty in tsconfig.json.",
              expected: "paths contains workspace mappings",
              actual: "paths is empty or missing",
            },
          ],
          fixes: [
            {
              id: "add-typescript-paths",
              title: "Add compilerOptions.paths",
              description: "Define workspace path aliases in tsconfig.json for project modules.",
              risk: "low",
              automatic: false,
              steps: [
                "Open tsconfig.json",
                "Add compilerOptions.paths with workspace package mappings.",
              ],
            },
          ],
        });
      }

      const referencesEmpty = !Array.isArray(references) || references.length === 0;
      if (referencesEmpty) {
        issues.push({
          id: "typescript-references-empty-monorepo",
          title: "TypeScript references are empty in a monorepo",
          category: "typescript",
          severity: Severity.Warning,
          message: "Monorepos should define project references in tsconfig.json.",
          evidence: [
            {
              id: "typescript-references-empty-evidence",
              type: "file",
              file: configPath,
              description: "The references array is missing or empty for the monorepo configuration.",
              expected: "references contains project references",
              actual: "references is empty or missing",
            },
          ],
          fixes: [
            {
              id: "add-typescript-references",
              title: "Add project references",
              description: "Define TypeScript project references in tsconfig.json for monorepo builds.",
              risk: "low",
              automatic: false,
              steps: [
                "Open tsconfig.json",
                "Add a references array with each workspace project path.",
              ],
            },
          ],
        });
      }
    }

    return issues;
  }
}
