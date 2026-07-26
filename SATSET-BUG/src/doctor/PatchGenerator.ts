import fs from "node:fs/promises";
import path from "node:path";
import type { PatchPlan } from "./PatchPlanner.js";
import type { ClassifiedError } from "./ErrorClassifier.js";

export interface GeneratedPatch {
  plan: PatchPlan;
  content?: string;
  filePath?: string;
}

export class PatchGenerator {
  async generate(plans: readonly PatchPlan[], classified: readonly ClassifiedError[], projectRoot: string): Promise<GeneratedPatch[]> {
    const patches: GeneratedPatch[] = [];
    for (const plan of plans) {
      if (plan.kind === "dependency-install") {
        patches.push({ plan, content: plan.patch, filePath: projectRoot });
        continue;
      }

      if (plan.kind === "file-edit") {
        const targetPath = plan.targetPath ? path.resolve(projectRoot, plan.targetPath) : undefined;
        const content = targetPath ? await this.readFile(targetPath) : undefined;
        patches.push({ plan, content, filePath: targetPath });
      }
    }

    for (const error of classified) {
      if (error.category === "typescript-config") {
        const tsconfigPath = path.join(projectRoot, "tsconfig.json");
        const current = await this.readFile(tsconfigPath).catch(() => "{}");
        patches.push({
          plan: {
            id: `tsconfig-${error.diagnostic.code ?? "config"}`,
            kind: "file-edit",
            summary: "Configure TypeScript for JSX and Node testing",
            description: "Ensure TypeScript can compile TSX and Node test files.",
            patch: current,
          },
          content: current,
          filePath: tsconfigPath,
        });
      }
    }

    return patches;
  }

  private async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, "utf8").catch(() => "");
  }
}
