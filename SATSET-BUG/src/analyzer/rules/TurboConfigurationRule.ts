import type { Context } from "../../core/Context.js";
import type { FixSuggestion } from "../../core/FixSuggestion.js";
import type { Issue } from "../../core/Issue.js";
import type { Evidence } from "../../core/Evidence.js";
import type { IRule } from "../IRule.js";
import { Severity } from "../../core/Severity.js";

export class TurboConfigurationRule implements IRule {
  public readonly id = "turbo-configuration";
  public readonly name = "Turbo Configuration";
  public readonly category = "turbo";

  public match(context: Context): boolean {
    const metadata = context.metadata as Record<string, unknown>;
    return metadata.turbo !== undefined && metadata.turbo !== null;
  }

  public analyze(context: Context): Issue[] {
    const metadata = context.metadata as Record<string, unknown>;
    const turboMetadata = metadata.turbo as Record<string, unknown> | null;
    const packageJson = metadata.packageJson as Record<string, unknown> | undefined;
    if (!turboMetadata) {
      return [];
    }

    const issues: Issue[] = [];
    const configExists = turboMetadata.configExists === true;
    const configPath = typeof turboMetadata.configPath === "string" ? turboMetadata.configPath : "turbo.json";
    const tasks = turboMetadata.tasks as Record<string, unknown> | null;
    const cache = turboMetadata.cache as Record<string, unknown> | null;
    const outputs = Array.isArray(turboMetadata.outputs) ? turboMetadata.outputs.map(String) : null;
    const remoteCache = turboMetadata.remoteCache as Record<string, unknown> | null;
    const turboPackageManager = typeof turboMetadata.packageManager === "string" ? turboMetadata.packageManager : null;
    const packageJsonPackageManager = typeof packageJson?.packageManager === "string" ? packageJson.packageManager.split("@")[0] : null;

    if (!configExists) {
      issues.push(this.createIssue({
        id: "turbo-config-missing",
        title: "Turbo configuration file is missing",
        severity: Severity.Error,
        message: "turbo.json is not present in the project root.",
        evidence: [
          {
            id: "turbo-config-missing-evidence",
            type: "file",
            file: configPath,
            description: "Turbo configuration file is required for workspace task orchestration.",
            expected: "turbo.json exists",
            actual: "missing",
          },
        ],
        fix: {
          id: "create-turbo-config",
          title: "Create turbo.json",
          description: "Add a turbo.json configuration file to define tasks, cache, and outputs.",
          risk: "low",
          automatic: false,
          steps: [
            "Create turbo.json in the project root.",
            "Define tasks, pipeline, cache, and outputs according to Turbo repo conventions.",
          ],
        },
      }));
    }

    if (!tasks || Object.keys(tasks).length === 0) {
      issues.push(this.createIssue({
        id: "turbo-tasks-empty",
        title: "Turbo tasks are not configured",
        severity: Severity.Error,
        message: "The Turbo configuration defines no tasks.",
        evidence: [
          {
            id: "turbo-tasks-empty-evidence",
            type: "file",
            file: configPath,
            description: "Turbo tasks must be defined to execute workspace commands.",
            expected: "tasks object contains at least one task",
            actual: "tasks is empty or missing",
          },
        ],
        fix: {
          id: "define-turbo-tasks",
          title: "Define Turbo tasks",
          description: "Add tasks to turbo.json for build, lint, test, or other workspace commands.",
          risk: "low",
          automatic: false,
          steps: [
            "Open turbo.json.",
            "Add a tasks object with named task definitions.",
          ],
        },
      }));
    }

    const cacheInvalid = cache !== null && !this.isValidCacheConfig(cache);
    if (cacheInvalid) {
      issues.push(this.createIssue({
        id: "turbo-cache-invalid",
        title: "Turbo cache configuration is invalid",
        severity: Severity.Warning,
        message: "The cache section in turbo.json is not configured correctly.",
        evidence: [
          {
            id: "turbo-cache-invalid-evidence",
            type: "file",
            file: configPath,
            description: "Turbo cache settings should include recognized cache fields.",
            expected: "cache contains valid Turbo cache configuration",
            actual: "invalid or unsupported cache configuration",
          },
        ],
        fix: {
          id: "fix-turbo-cache",
          title: "Fix Turbo cache configuration",
          description: "Update the turbo.json cache section with supported settings.",
          risk: "low",
          automatic: false,
          steps: [
            "Open turbo.json.",
            "Ensure the cache object includes supported properties such as enabled and directory.",
          ],
        },
      }));
    }

    if (!outputs || outputs.length === 0) {
      issues.push(this.createIssue({
        id: "turbo-outputs-empty",
        title: "Turbo outputs are not configured",
        severity: Severity.Warning,
        message: "Turbo configuration does not specify outputs.",
        evidence: [
          {
            id: "turbo-outputs-empty-evidence",
            type: "file",
            file: configPath,
            description: "Turbo outputs are required for cache invalidation and task incrementalization.",
            expected: "outputs array contains output paths",
            actual: "outputs is empty or missing",
          },
        ],
        fix: {
          id: "define-turbo-outputs",
          title: "Define Turbo outputs",
          description: "Add output paths to turbo.json so Turbo can manage task cache consistency.",
          risk: "low",
          automatic: false,
          steps: [
            "Open turbo.json.",
            "Add an outputs array with files or directories produced by tasks.",
          ],
        },
      }));
    }

    if (remoteCache && !this.isValidRemoteCache(remoteCache)) {
      issues.push(this.createIssue({
        id: "turbo-remote-cache-invalid",
        title: "Turbo remote cache configuration is invalid",
        severity: Severity.Warning,
        message: "The remoteCache section in turbo.json is missing required configuration.",
        evidence: [
          {
            id: "turbo-remote-cache-invalid-evidence",
            type: "file",
            file: configPath,
            description: "Remote cache needs a valid url or GitHub remote cache configuration.",
            expected: "remoteCache contains a valid remote cache configuration",
            actual: "invalid remoteCache object",
          },
        ],
        fix: {
          id: "fix-turbo-remote-cache",
          title: "Fix Turbo remote cache settings",
          description: "Provide a valid remote cache configuration in turbo.json.",
          risk: "low",
          automatic: false,
          steps: [
            "Open turbo.json.",
            "Add or correct the remoteCache configuration with a valid url or provider.",
          ],
        },
      }));
    }

    if (
      turboPackageManager &&
      packageJsonPackageManager &&
      turboPackageManager !== packageJsonPackageManager
    ) {
      issues.push(this.createIssue({
        id: "turbo-package-manager-mismatch",
        title: "Turbo package manager does not match workspace package manager",
        severity: Severity.Warning,
        message: `turbo.json package manager is set to '${turboPackageManager}', but package.json workspace package manager is '${packageJsonPackageManager}'.`, 
        evidence: [
          {
            id: "turbo-package-manager-mismatch-evidence",
            type: "file",
            file: "package.json",
            description: "Turbo metadata package manager does not match the package.json packageManager field.",
            expected: `packageManager should be ${packageJsonPackageManager}`,
            actual: turboPackageManager,
          },
        ],
        fix: {
          id: "align-turbo-package-manager",
          title: "Align Turbo package manager with workspace package manager",
          description: "Use the same package manager in turbo.json and package.json.",
          risk: "low",
          automatic: false,
          steps: [
            "Open package.json and turbo.json.",
            "Set the packageManager value consistently across both files.",
          ],
        },
      }));
    }

    return issues;
  }

  private isValidCacheConfig(cache: Record<string, unknown>): boolean {
    const validKeys = new Set(["enabled", "directory", "cacheDirectory", "fetch", "store", "pipeline"]);
    const keys = Object.keys(cache);
    if (keys.length === 0) {
      return false;
    }
    return keys.some((key) => validKeys.has(key));
  }

  private isValidRemoteCache(remoteCache: Record<string, unknown>): boolean {
    if (Object.keys(remoteCache).length === 0) {
      return false;
    }

    const url = typeof remoteCache.url === "string" ? remoteCache.url.trim() : "";
    const github = typeof remoteCache.github === "object" && remoteCache.github !== null;

    return url.length > 0 || github;
  }

  private createIssue(args: {
    id: string;
    title: string;
    severity: Severity;
    message: string;
    evidence: Evidence[];
    fix: FixSuggestion;
  }): Issue {
    return {
      id: args.id,
      title: args.title,
      category: this.category,
      severity: args.severity,
      message: args.message,
      evidence: args.evidence,
      fixes: [args.fix],
    };
  }
}
