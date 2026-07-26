import type { Capability } from "./Capability.js";

export interface ProjectMetadata {
  root: string;
  packageJson?: unknown;
  tsconfig?: unknown;
  pnpmWorkspace?: unknown;
  packageManager?: "npm" | "pnpm" | "yarn" | "bun";
  nodeVersion?: string;
  typescriptVersion?: string;
  prisma?: unknown;
  next?: unknown;
  turbo?: unknown;
  tailwind?: unknown;
  react?: unknown;
  git?: unknown;
  environment?: unknown;
  frameworks?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspacePackages?: string[];
  capabilities?: Capability[];
  [key: string]: unknown;
}
