import type { Context } from "../../core/Context.js";
import type { FixSuggestion } from "../../core/FixSuggestion.js";
import type { Issue } from "../../core/Issue.js";
import type { Evidence } from "../../core/Evidence.js";
import type { IRule } from "../IRule.js";
import { Severity } from "../../core/Severity.js";

export class DependencyConflictRule implements IRule {
  public readonly id = "dependency-conflict";
  public readonly name = "Dependency Conflict";
  public readonly category = "dependency";

  public match(context: Context): boolean {
    const metadata = context.metadata as Record<string, unknown>;
    return metadata.dependencies !== undefined && metadata.dependencies !== null;
  }

  public analyze(context: Context): Issue[] {
    const metadata = context.metadata as Record<string, unknown>;
    const dependenciesMetadata = metadata.dependencies as Record<string, unknown> | null;
    if (!dependenciesMetadata) {
      return [];
    }

    const duplicatePackages = Array.isArray(dependenciesMetadata.duplicatePackages)
      ? dependenciesMetadata.duplicatePackages.map(String)
      : [];
    const versionConflicts = dependenciesMetadata.versionConflicts as Record<string, unknown> | null;
    const circularCandidates = Array.isArray(dependenciesMetadata.circularCandidates)
      ? dependenciesMetadata.circularCandidates.filter(Array.isArray).map((cycle) => cycle.map(String))
      : [];
    const unusedCandidates = Array.isArray(dependenciesMetadata.unusedCandidates)
      ? dependenciesMetadata.unusedCandidates.map(String)
      : [];
    const peerDependencies = Array.isArray(dependenciesMetadata.peerDependencies)
      ? dependenciesMetadata.peerDependencies.map(String)
      : [];

    const issues: Issue[] = [];

    if (duplicatePackages.length > 0) {
      issues.push(this.createIssue({
        id: "duplicate-package-dependencies",
        title: "Duplicate package declarations detected",
        severity: Severity.Warning,
        message: `Found duplicate package declarations for ${duplicatePackages.join(", ")}.`,
        evidence: [
          {
            id: "duplicate-package-dependencies-evidence",
            type: "metadata",
            file: "package.json",
            description: "The dependency graph contains packages declared multiple times across workspace packages.",
            expected: "Each package is declared once",
            actual: duplicatePackages.join(", "),
          },
        ],
        fix: {
          id: "remove-duplicate-dependencies",
          title: "Remove duplicate dependency declarations",
          description: "Ensure each package dependency is declared only once in workspace package definitions.",
          risk: "low",
          automatic: false,
          steps: [
            "Review package.json files in the workspace.",
            "Consolidate duplicate dependency declarations and keep a single version.",
          ],
        },
      }));
    }

    if (versionConflicts && Object.keys(versionConflicts).length > 0) {
      const conflictEntries = Object.entries(versionConflicts).map(
        ([name, versions]) => `${name}: ${Array.isArray(versions) ? versions.join(", ") : String(versions)}`
      );

      issues.push(this.createIssue({
        id: "dependency-version-conflicts",
        title: "Dependency version conflicts detected",
        severity: Severity.Warning,
        message: `Found version conflicts for dependencies: ${conflictEntries.join("; ")}.`,
        evidence: [
          {
            id: "dependency-version-conflicts-evidence",
            type: "metadata",
            file: "package.json",
            description: "Some dependencies are required at multiple versions across workspace packages.",
            expected: "Single version per dependency",
            actual: conflictEntries.join("; "),
          },
        ],
        fix: {
          id: "resolve-version-conflicts",
          title: "Resolve dependency version conflicts",
          description: "Align dependency versions across workspace packages so the same package uses one version.",
          risk: "medium",
          automatic: false,
          steps: [
            "Review the version conflict report.",
            "Update package.json files so conflicting dependencies use a single compatible version.",
          ],
        },
      }));
    }

    if (circularCandidates.length > 0) {
      issues.push(this.createIssue({
        id: "circular-dependency-candidates",
        title: "Circular dependency candidates detected",
        severity: Severity.Error,
        message: `Detected ${circularCandidates.length} circular dependency candidate(s).`,
        evidence: [
          {
            id: "circular-dependency-candidates-evidence",
            type: "metadata",
            file: "package.json",
            description: "A circular dependency was detected among workspace packages.",
            expected: "Acyclic dependency graph",
            actual: circularCandidates.map((cycle) => cycle.join(" -> ")).join("; "),
          },
        ],
        fix: {
          id: "break-circular-dependencies",
          title: "Break circular dependencies",
          description: "Refactor dependencies to remove cycles between packages.",
          risk: "medium",
          automatic: false,
          steps: [
            "Identify the cycle path from the evidence.",
            "Refactor dependencies so packages no longer depend on each other in a loop.",
          ],
        },
      }));
    }

    if (unusedCandidates.length > 0) {
      issues.push(this.createIssue({
        id: "unused-dependency-candidates",
        title: "Unused dependency candidates found",
        severity: Severity.Warning,
        message: `Found unused dependency candidate(s): ${unusedCandidates.join(", ")}.`,
        evidence: [
          {
            id: "unused-dependency-candidates-evidence",
            type: "metadata",
            file: "package.json",
            description: "These workspace packages were declared but are not referenced by other packages.",
            expected: "Unused dependencies should be removed or referenced",
            actual: unusedCandidates.join(", "),
          },
        ],
        fix: {
          id: "remove-unused-dependencies",
          title: "Remove unused dependencies",
          description: "Delete unused dependency declarations or reintroduce references if they are required.",
          risk: "low",
          automatic: false,
          steps: [
            "Review unused dependency candidates.",
            "Remove unused dependencies from package.json or use them in code if needed.",
          ],
        },
      }));
    }

    const peerMismatchNames = this.getPeerMismatchNames(peerDependencies, versionConflicts);
    if (peerMismatchNames.length > 0) {
      issues.push(this.createIssue({
        id: "peer-dependency-mismatch",
        title: "Peer dependency mismatch detected",
        severity: Severity.Warning,
        message: `Peer dependency mismatch found for: ${peerMismatchNames.join(", ")}.`,
        evidence: [
          {
            id: "peer-dependency-mismatch-evidence",
            type: "metadata",
            file: "package.json",
            description: "Peer dependencies have conflicting requirements or are declared inconsistently.",
            expected: "Peer dependencies should resolve to a compatible version",
            actual: peerMismatchNames.join(", "),
          },
        ],
        fix: {
          id: "resolve-peer-dependency-mismatch",
          title: "Resolve peer dependency mismatch",
          description: "Align peer dependency versions so they satisfy all package requirements.",
          risk: "medium",
          automatic: false,
          steps: [
            "Review peer dependency requirements across workspace packages.",
            "Update peer dependency versions to a compatible range.",
          ],
        },
      }));
    }

    return issues;
  }

  private getPeerMismatchNames(peerDependencies: string[], versionConflicts: Record<string, unknown> | null): string[] {
    if (!versionConflicts) {
      return [];
    }

    return peerDependencies.filter((name) =>
      Object.prototype.hasOwnProperty.call(versionConflicts, name)
    );
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
