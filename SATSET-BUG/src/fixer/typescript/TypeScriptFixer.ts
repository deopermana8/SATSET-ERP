import type { Context } from "../../core/Context.js";
import type { FixPlan } from "../FixPlan.js";
import type { Issue } from "../../core/Issue.js";

const SUPPORTED_IDS = new Set([
  "typescript-strict-disabled",
  "typescript-module-resolution-invalid",
  "typescript-references-empty-monorepo",
  "typescript-paths-empty-workspace",
]);

export class TypeScriptFixer {
  public canFix(issue: Issue): boolean {
    return Boolean(issue && SUPPORTED_IDS.has(issue.id));
  }

  public analyze(issue: Issue, context: Context): FixPlan[] {
    if (!this.canFix(issue)) {
      return [];
    }

    const plan = this.createFixPlan(issue, context);
    return plan ? [plan] : [];
  }

  public fix(issue: Issue, context: Context): FixPlan[] {
    return this.analyze(issue, context);
  }

  private createFixPlan(issue: Issue, context: Context): FixPlan | null {
    switch (issue.id) {
      case "typescript-strict-disabled":
        return this.createStrictFixPlan(issue);
      case "typescript-module-resolution-invalid":
        return this.createModuleResolutionFixPlan(issue);
      case "typescript-references-empty-monorepo":
        return this.createReferencesFixPlan(issue, context);
      case "typescript-paths-empty-workspace":
        return this.createPathsFixPlan(issue, context);
      default:
        return null;
    }
  }

  private createStrictFixPlan(issue: Issue): FixPlan {
    return {
      id: "fix-typescript-strict",
      title: "Enable TypeScript strict mode",
      description: "Update tsconfig.json to enable compilerOptions.strict for stronger type safety.",
      commands: ["Patch tsconfig.json: set compilerOptions.strict to true."],
      filesToModify: ["tsconfig.json"],
      risk: "low",
      estimatedTime: "5 minutes",
      rollbackPlan: ["Revert tsconfig.json to restore the previous strict compiler option value."],
    };
  }

  private createModuleResolutionFixPlan(issue: Issue): FixPlan {
    return {
      id: "fix-typescript-module-resolution",
      title: "Add moduleResolution to tsconfig.json",
      description: "Patch tsconfig.json to include a standard moduleResolution setting such as node.",
      commands: [
        "Patch tsconfig.json: add or update compilerOptions.moduleResolution to 'node' or another supported value.",
      ],
      filesToModify: ["tsconfig.json"],
      risk: "low",
      estimatedTime: "5 minutes",
      rollbackPlan: ["Revert tsconfig.json to its previous moduleResolution setting."],
    };
  }

  private createReferencesFixPlan(issue: Issue, context: Context): FixPlan {
    const referencesEntry = this.suggestReferences(context);
    return {
      id: "fix-typescript-references",
      title: "Add TypeScript project references",
      description: "Patch tsconfig.json to include project references for monorepo packages.",
      commands: [
        "Patch tsconfig.json: add a references array to the root tsconfig with each workspace package path.",
        referencesEntry ? `Suggested references: ${referencesEntry}` : "Add the required project references manually.",
      ].filter(Boolean),
      filesToModify: ["tsconfig.json"],
      risk: "medium",
      estimatedTime: "15 minutes",
      rollbackPlan: ["Revert tsconfig.json to remove or restore the previous references configuration."],
    };
  }

  private createPathsFixPlan(issue: Issue, context: Context): FixPlan {
    const pathsEntry = this.suggestPaths(context);
    return {
      id: "fix-typescript-paths",
      title: "Repair TypeScript paths mapping",
      description: "Patch tsconfig.json to add compilerOptions.paths mappings for workspace packages.",
      commands: [
        "Patch tsconfig.json: add compilerOptions.paths with the appropriate alias mappings.",
        pathsEntry ? `Suggested paths mapping: ${pathsEntry}` : "Add the workspace path mappings manually.",
      ].filter(Boolean),
      filesToModify: ["tsconfig.json"],
      risk: "medium",
      estimatedTime: "15 minutes",
      rollbackPlan: ["Revert tsconfig.json to restore the previous compilerOptions.paths configuration."],
    };
  }

  private suggestReferences(context: Context): string | null {
    const metadata = context.metadata as Record<string, unknown>;
    const packageJson = metadata.packageJson as Record<string, unknown> | undefined;
    if (!packageJson) {
      return null;
    }

    const workspaces = packageJson.workspaces;
    if (!workspaces) {
      return null;
    }

    const patterns = Array.isArray(workspaces)
      ? workspaces.map(String)
      : Array.isArray((workspaces as Record<string, unknown>).packages)
      ? ((workspaces as Record<string, unknown>).packages as unknown[]).map(String)
      : [];

    return patterns.length > 0 ? JSON.stringify(patterns.map((pattern) => ({ path: pattern.replace(/\/*$/, "") })), null, 2) : null;
  }

  private suggestPaths(context: Context): string | null {
    const metadata = context.metadata as Record<string, unknown>;
    const packageJson = metadata.packageJson as Record<string, unknown> | undefined;
    if (!packageJson) {
      return null;
    }

    const workspaces = packageJson.workspaces;
    if (!workspaces) {
      return null;
    }

    const patterns = Array.isArray(workspaces)
      ? workspaces.map(String)
      : Array.isArray((workspaces as Record<string, unknown>).packages)
      ? ((workspaces as Record<string, unknown>).packages as unknown[]).map(String)
      : [];

    if (patterns.length === 0) {
      return null;
    }

    const paths = patterns.reduce<Record<string, string[]>>((result, pattern) => {
      const normalized = pattern.replace(/\/*$/, "");
      const alias = `${normalized}/*`;
      result[alias] = [`${normalized}/*`];
      return result;
    }, {});

    return JSON.stringify(paths, null, 2);
  }
}
