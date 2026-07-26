import { promises as fs } from "fs";
import path from "path";
import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

export class PackageJsonScanner implements IScanner {
  public readonly name = "PackageJsonScanner";

  public async scan(context: Context): Promise<void> {
    const packageJsonPath = path.join(context.projectRoot, "package.json");

    try {
      const content = await fs.readFile(packageJsonPath, "utf-8");
      const parsed = JSON.parse(content) as {
        name?: string;
        version?: string;
        packageManager?: string;
        workspaces?: unknown;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        scripts?: Record<string, string>;
        engines?: Record<string, string>;
      };

      context.metadata.packageJson = {
        name: parsed.name,
        version: parsed.version,
        packageManager: parsed.packageManager,
        workspaces: parsed.workspaces,
        dependencies: parsed.dependencies,
        devDependencies: parsed.devDependencies,
        scripts: parsed.scripts,
        engines: parsed.engines,
      };
    } catch {
      context.metadata.packageJson = null;
    }
  }
}
