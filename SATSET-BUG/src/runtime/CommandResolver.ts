import { BinaryResolver } from "./BinaryResolver.js";
import { WorkspaceResolver } from "./WorkspaceResolver.js";

export interface ResolvedCommand {
  command: string;
  args: string[];
  cwd: string;
  strategy: string;
  confidence: number;
}

export interface CommandResolverInput {
  tool: string;
  args: string[];
  projectRoot: string;
}

export class CommandResolver {
  constructor(
    private readonly workspaceResolver: WorkspaceResolver = new WorkspaceResolver(),
    private readonly binaryResolver: BinaryResolver = new BinaryResolver(workspaceResolver)
  ) {}

  async resolve(input: CommandResolverInput): Promise<ResolvedCommand> {
    const fallback: ResolvedCommand = {
      command: input.tool,
      args: [...input.args],
      cwd: input.projectRoot,
      strategy: "fallback",
      confidence: 0.1,
    };

    try {
      const cwd = await this.workspaceResolver.findProjectRoot(input.projectRoot);
      const resolution = await this.binaryResolver.resolve(input.tool, cwd);
      const mapped = this.mapResolution(resolution.strategy, resolution.command, input.tool, input.args);

      return {
        command: mapped.command,
        args: mapped.args,
        cwd: resolution.workingDirectory || cwd,
        strategy: resolution.strategy,
        confidence: this.confidenceForStrategy(resolution.strategy, resolution.found),
      };
    } catch {
      return fallback;
    }
  }

  private mapResolution(
    strategy: string,
    resolvedCommand: string,
    tool: string,
    args: string[]
  ): { command: string; args: string[] } {
    switch (strategy) {
      case "pnpm exec":
        return { command: "pnpm", args: ["exec", tool, ...args] };
      case "npm exec":
        return { command: "npm", args: ["exec", "--", tool, ...args] };
      case "npx":
        return { command: "npx", args: [tool, ...args] };
      case "yarn":
        return { command: "yarn", args: [tool, ...args] };
      case "bunx":
        return { command: "bunx", args: [tool, ...args] };
      default:
        return { command: resolvedCommand || tool, args: [...args] };
    }
  }

  private confidenceForStrategy(strategy: string, found: boolean): number {
    if (!found) {
      return 0.1;
    }

    switch (strategy) {
      case "node_modules/.bin":
        return 0.99;
      case "workspace node_modules/.bin":
        return 0.95;
      case "pnpm exec":
        return 0.92;
      case "npm exec":
        return 0.9;
      case "npx":
        return 0.85;
      case "yarn":
        return 0.85;
      case "bunx":
        return 0.85;
      case "PATH":
        return 0.75;
      default:
        return 0.5;
    }
  }
}
