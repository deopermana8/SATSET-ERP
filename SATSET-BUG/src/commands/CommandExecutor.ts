import { spawn } from "node:child_process";
import path from "node:path";

export interface CommandExecutionResult {
  command: string;
  args: string[];
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export class CommandExecutor {
  public async run(command: string, args: string[] = [], options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): Promise<CommandExecutionResult> {
    const startedAt = Date.now();
    const child = spawn(command, args, {
      cwd: options.cwd ?? process.cwd(),
      env: options.env ?? process.env,
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    const exitCode = await new Promise<number | null>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", resolve);
    });

    return {
      command,
      args,
      exitCode,
      stdout,
      stderr,
      durationMs: Date.now() - startedAt,
    };
  }

  public async pnpm(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("pnpm", args, { cwd });
  }

  public async npm(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("npm", args, { cwd });
  }

  public async npx(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("npx", args, { cwd });
  }

  public async prisma(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("prisma", args, { cwd });
  }

  public async git(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("git", args, { cwd });
  }

  public async docker(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("docker", args, { cwd });
  }

  public async turbo(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("turbo", args, { cwd });
  }

  public async next(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("next", args, { cwd });
  }

  public async node(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("node", args, { cwd });
  }

  public async tsc(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("tsc", args, { cwd });
  }

  public async eslint(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("eslint", args, { cwd });
  }

  public async prettier(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("prettier", args, { cwd });
  }

  public async vitest(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("vitest", args, { cwd });
  }

  public async jest(args: string[], cwd?: string): Promise<CommandExecutionResult> {
    return this.run("jest", args, { cwd });
  }
}
