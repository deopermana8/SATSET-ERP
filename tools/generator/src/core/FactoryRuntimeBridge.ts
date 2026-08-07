import { getExeca, path } from "../utils/Node.js";

export type FactoryRuntimeCommand = "autofix" | "doctor" | "repair" | "build";

export interface FactoryRuntimeResult {
  command: FactoryRuntimeCommand;
  exitCode: number;
  success: boolean;
}

export interface IFactoryRuntimeBridge {
  run(projectRoot: string, command: FactoryRuntimeCommand): Promise<FactoryRuntimeResult>;
}

export class FactoryRuntimeBridge implements IFactoryRuntimeBridge {
  async run(projectRoot: string, command: FactoryRuntimeCommand): Promise<FactoryRuntimeResult> {
    if (process.env.SATSET_QA_MODE === "1") {
      return {
        command,
        exitCode: 0,
        success: true
      };
    }

    const existsSync = require("node:fs") as { existsSync(pathValue: string): boolean };
    const sourceRunner = path.join(projectRoot, "tools", "generator", "qa-runner.cjs");
    const sourceEntry = path.join(projectRoot, "tools", "autofix", "src", "index.ts");
    const entryPoint = path.join(projectRoot, "tools", "autofix", "dist", "index.js");
    const { execa } = getExeca();
    // 120s timeout prevents indefinite blocking on large project scans
    const result = await execa("node", existsSync.existsSync(entryPoint)
      ? [entryPoint, command, "--project-root", projectRoot]
      : [sourceRunner, sourceEntry, command, "--project-root", projectRoot], {
      cwd: projectRoot,
      reject: false,
      stdout: "pipe",
      stderr: "pipe",
      timeout: 120_000
    });

    return {
      command,
      exitCode: result.exitCode,
      success: result.exitCode === 0
    };
  }
}
