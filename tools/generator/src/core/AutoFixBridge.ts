import { getExeca, path } from "../utils/Node.js";
import { Context } from "./Context.js";

export interface IAutoFixBridge {
  run(context: Context): Promise<boolean>;
}

export class AutoFixBridge implements IAutoFixBridge {
  async run(context: Context): Promise<boolean> {
    if (process.env.SATSET_QA_MODE === "1") {
      context.log("info", "AutoFix bridge skipped in QA mode");
      return true;
    }

    const sourceRunner = path.join(context.projectRoot, "tools", "generator", "qa-runner.cjs");
    const sourceEntry = path.join(context.projectRoot, "tools", "autofix", "src", "index.ts");
    const entryPoint = path.join(context.projectRoot, "tools", "autofix", "dist", "index.js");
    const startScript = path.join(context.projectRoot, "tools", "autofix", "Start-AutoFix.ps1");
    const existsSync = require("node:fs") as { existsSync(pathValue: string): boolean };

    if (existsSync.existsSync(entryPoint)) {
      const { execa } = getExeca();
      await execa("node", [entryPoint, "start", "--project-root", context.projectRoot], {
        cwd: context.projectRoot,
        reject: false,
        stdout: "pipe",
        stderr: "pipe"
      });
      context.log("info", "AutoFix bridge executed via dist/index.js");
      return true;
    }

    if (existsSync.existsSync(sourceRunner) && existsSync.existsSync(sourceEntry)) {
      const { execa } = getExeca();
      await execa("node", [sourceRunner, sourceEntry, "start", "--project-root", context.projectRoot], {
        cwd: context.projectRoot,
        reject: false,
        stdout: "pipe",
        stderr: "pipe"
      });
      context.log("info", "AutoFix bridge executed via source runner");
      return true;
    }

    if (existsSync.existsSync(startScript)) {
      const { execa } = getExeca();
      await execa("powershell", ["-ExecutionPolicy", "Bypass", "-File", startScript, "-ProjectRoot", context.projectRoot], {
        cwd: context.projectRoot,
        reject: false,
        stdout: "pipe",
        stderr: "pipe"
      });
      context.log("info", "AutoFix bridge executed via Start-AutoFix.ps1");
      return true;
    }

    context.log("warn", "AutoFix bridge skipped because tools/autofix entry point was not found");
    return false;
  }
}
