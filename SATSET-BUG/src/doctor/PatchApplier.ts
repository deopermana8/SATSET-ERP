import fs from "node:fs/promises";
import path from "node:path";
import { CommandExecutor } from "../commands/CommandExecutor.js";
import type { GeneratedPatch } from "./PatchGenerator.js";

export interface PatchApplicationResult {
  applied: boolean;
  filePath?: string;
  reason: string;
}

export class PatchApplier {
  constructor(private readonly executor = new CommandExecutor()) {}

  async apply(patches: readonly GeneratedPatch[], projectRoot: string): Promise<PatchApplicationResult[]> {
    const results: PatchApplicationResult[] = [];
    for (const patch of patches) {
      if (patch.plan.kind === "dependency-install") {
        const result = await this.executor.run("npm", ["install", "react", "react-dom", "@types/react", "@types/react-dom"], { cwd: projectRoot });
        results.push({ applied: result.exitCode === 0, filePath: projectRoot, reason: result.exitCode === 0 ? "Dependency install completed." : result.stderr || result.stdout });
        continue;
      }

      if (patch.filePath) {
        const resolved = path.resolve(projectRoot, patch.filePath);
        await fs.mkdir(path.dirname(resolved), { recursive: true });
        await fs.writeFile(resolved, patch.content ?? "", "utf8");
        results.push({ applied: true, filePath: resolved, reason: "File updated." });
      }
    }
    return results;
  }
}
