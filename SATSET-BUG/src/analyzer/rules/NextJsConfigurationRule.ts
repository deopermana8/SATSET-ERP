import type { Context } from "../../core/Context.js";
import type { FixSuggestion } from "../../core/FixSuggestion.js";
import type { Issue } from "../../core/Issue.js";
import type { Evidence } from "../../core/Evidence.js";
import type { IRule } from "../IRule.js";
import { Severity } from "../../core/Severity.js";

export class NextJsConfigurationRule implements IRule {
  public readonly id = "nextjs-configuration";
  public readonly name = "Next.js Configuration";
  public readonly category = "next";

  public match(context: Context): boolean {
    const metadata = context.metadata as Record<string, unknown>;
    return metadata.next !== undefined && metadata.next !== null;
  }

  public analyze(context: Context): Issue[] {
    const metadata = context.metadata as Record<string, unknown>;
    const nextMetadata = metadata.next as Record<string, unknown> | null;
    if (!nextMetadata) {
      return [];
    }

    const issues: Issue[] = [];
    const nextExists = nextMetadata.exists === true;
    const configExists = nextMetadata.configExists === true;
    const appRouter = nextMetadata.appRouter === true;
    const pagesRouter = nextMetadata.pagesRouter === true;
    const turbopack = nextMetadata.turbopack === true;
    const reactVersion = typeof nextMetadata.reactVersion === "string" ? nextMetadata.reactVersion : null;
    const nextVersion = typeof nextMetadata.nextVersion === "string" ? nextMetadata.nextVersion : null;
    const typescriptEnabled = nextMetadata.typescript === true;
    const configPath = typeof nextMetadata.configPath === "string" ? nextMetadata.configPath : "next.config";

    if (!nextExists) {
      issues.push(this.createIssue({
        id: "nextjs-not-detected",
        title: "Next.js is not detected",
        severity: Severity.Error,
        message: "The project metadata does not indicate a Next.js installation.",
        evidence: [
          {
            id: "nextjs-not-detected-evidence",
            type: "metadata",
            file: "package.json",
            description: "Next package was not found in project dependencies.",
          },
        ],
        fix: {
          id: "install-nextjs",
          title: "Install Next.js",
          description: "Add Next.js to the project dependencies and configure it in package.json.",
          risk: "low",
          automatic: false,
          steps: ["Run npm install next react react-dom --save"],
        },
      }));
    }

    if (nextExists && !configExists) {
      issues.push(this.createIssue({
        id: "next-config-missing",
        title: "Next.js configuration file is missing",
        severity: Severity.Error,
        message: "next.config.js, next.config.mjs, or next.config.ts was not found.",
        evidence: [
          {
            id: "next-config-missing-evidence",
            type: "file",
            file: configPath,
            description: "Next.js configuration file is required for advanced Next.js settings.",
            expected: "next.config.js or next.config.mjs or next.config.ts exists",
            actual: "missing",
          },
        ],
        fix: {
          id: "create-next-config",
          title: "Create a Next.js configuration file",
          description: "Add a next.config.js or next.config.mjs file to configure Next.js behavior.",
          risk: "low",
          automatic: false,
          steps: ["Create next.config.js in the project root.", "Define required settings such as reactStrictMode or experimental flags."],
        },
      }));
    }

    if (appRouter && pagesRouter) {
      issues.push(this.createIssue({
        id: "next-app-and-pages-router-conflict",
        title: "App Router and Pages Router are both active",
        severity: Severity.Error,
        message: "The project appears to be using both App Router and Pages Router at the same time.",
        evidence: [
          {
            id: "next-router-mode-conflict-evidence",
            type: "metadata",
            file: configPath,
            description: "Both appRouter and pagesRouter are enabled in Next.js metadata.",
          },
        ],
        fix: {
          id: "choose-next-router",
          title: "Use a single Next.js routing mode",
          description: "Choose either the App Router or the Pages Router and remove conflicting routes or settings.",
          risk: "medium",
          automatic: false,
          steps: ["Review app/ and pages/ directories.", "Consolidate routing into one supported router mode."],
        },
      }));
    }

    if (nextExists && reactVersion && nextVersion && !this.isReactCompatibleWithNext(nextVersion, reactVersion)) {
      issues.push(this.createIssue({
        id: "next-react-version-mismatch",
        title: "React version does not match Next.js version",
        severity: Severity.Warning,
        message: `Next.js ${nextVersion} may not be compatible with React ${reactVersion}.`,
        evidence: [
          {
            id: "next-react-version-mismatch-evidence",
            type: "metadata",
            file: "package.json",
            description: "React and Next.js versions appear to be incompatible.",
            expected: "React version compatible with Next.js",
            actual: `React ${reactVersion} / Next.js ${nextVersion}`,
          },
        ],
        fix: {
          id: "align-react-next-versions",
          title: "Align React and Next.js versions",
          description: "Update package versions so React and Next.js are compatible.",
          risk: "medium",
          automatic: false,
          steps: ["Review package.json dependencies.", "Install matching React and Next.js versions."],
        },
      }));
    }

    if (nextExists && turbopack && !configExists) {
      issues.push(this.createIssue({
        id: "next-turbopack-config-issue",
        title: "Turbopack is enabled but configuration is missing or invalid",
        severity: Severity.Warning,
        message: "Turbopack was detected, but Next.js configuration is missing or does not support the setting.",
        evidence: [
          {
            id: "next-turbopack-config-evidence",
            type: "metadata",
            file: configPath,
            description: "Turbopack is enabled while the Next.js config is missing or invalid.",
            expected: "Valid next.config.* file with turbopack support",
            actual: "missing or invalid config",
          },
        ],
        fix: {
          id: "validate-turbopack-configuration",
          title: "Validate Turbopack configuration",
          description: "Ensure Turbopack is configured correctly in Next.js configuration.",
          risk: "medium",
          automatic: false,
          steps: ["Verify the Turbopack experimental settings in next.config.*.", "Remove or adjust unsupported Turbopack configuration."],
        },
      }));
    }

    if (nextExists && !typescriptEnabled) {
      issues.push(this.createIssue({
        id: "next-typescript-inactive",
        title: "TypeScript is not enabled for Next.js project",
        severity: Severity.Warning,
        message: "A Next.js project should typically use TypeScript for the best developer experience.",
        evidence: [
          {
            id: "next-typescript-inactive-evidence",
            type: "metadata",
            file: "package.json",
            description: "TypeScript is not detected in the Next.js project metadata.",
            expected: "typescript dependency present",
            actual: "typescript not enabled",
          },
        ],
        fix: {
          id: "enable-typescript-for-next",
          title: "Enable TypeScript",
          description: "Add TypeScript support to the Next.js project.",
          risk: "low",
          automatic: false,
          steps: ["Install typescript and @types/react.", "Create or update tsconfig.json."],
        },
      }));
    }

    return issues;
  }

  private isReactCompatibleWithNext(nextVersion: string, reactVersion: string): boolean {
    const nextMajor = this.parseMajorVersion(nextVersion);
    const reactMajor = this.parseMajorVersion(reactVersion);
    if (nextMajor === null || reactMajor === null) {
      return true;
    }
    if (nextMajor >= 13) {
      return reactMajor === 18 || reactMajor === 19;
    }
    if (nextMajor === 12) {
      return reactMajor === 17 || reactMajor === 18;
    }
    return reactMajor === 16 || reactMajor === 17;
  }

  private parseMajorVersion(version: string): number | null {
    const match = version.match(/\d+/);
    return match ? Number(match[0]) : null;
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
